/**
 * scripts/download-product-images.ts
 *
 * 从 Pixabay API 自动搜索并下载 82 道菜的商品图，统一处理后输出。
 *
 * 前置条件：
 *   1. 去 https://pixabay.com/api/docs/ 注册免费获取 API Key
 *   2. 设置环境变量：export PIXABAY_API_KEY="你的key"
 *
 * 运行方式：
 *   PIXABAY_API_KEY=xxx npx tsx scripts/download-product-images.ts
 *
 * 流程：
 *   每道菜用英文关键词搜索 Pixabay → 下载最佳匹配 → sharp 处理为 800×800 jpg
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const CSV_PATH = path.join(ROOT, "public/image_sources/image_tasks.csv");
const OUTPUT_DIR = path.join(ROOT, "public/images/products");
const CANDIDATES_DIR = path.join(ROOT, "public/images/product_candidates");
const DELAY_MS = 1200; // Pixabay 免费 API 限速 ~30 req/min

// ============================================================
// 类型
// ============================================================

type TaskRow = {
  id: number;
  name: string;
  category: string;
  queryCn: string;
  queryEn: string;
  localPath: string;
};

type PixabayHit = {
  id: number;
  pageURL: string;
  webformatURL: string;
  largeImageURL: string;
  tags: string;
  user: string;
  imageWidth: number;
  imageHeight: number;
};

type PixabayResponse = {
  total: number;
  totalHits: number;
  hits: PixabayHit[];
};

// ============================================================
// CSV 解析
// ============================================================

function parseCsv(filePath: string): TaskRow[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  const lines = raw.trim().split("\n");
  const headers = lines[0].split(",");

  const idIdx = headers.indexOf("id");
  const nameIdx = headers.indexOf("name");
  const categoryIdx = headers.indexOf("category");
  const queryCnIdx = headers.indexOf("query_cn");
  const queryEnIdx = headers.indexOf("query_en");
  const localPathIdx = headers.indexOf("local_path");

  const rows: TaskRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    rows.push({
      id: Number(cols[idIdx]),
      name: cols[nameIdx],
      category: cols[categoryIdx],
      queryCn: cols[queryCnIdx],
      queryEn: cols[queryEnIdx],
      localPath: cols[localPathIdx],
    });
  }

  return rows;
}

/** 简单 CSV 行解析（支持引号包裹） */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

// ============================================================
// Pixabay 搜索
// ============================================================

async function searchPixabay(
  query: string,
  apiKey: string,
  retries = 3,
): Promise<PixabayHit | null> {
  const url = new URL("https://pixabay.com/api/");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("q", encodeURIComponent(query));
  url.searchParams.set("image_type", "photo");
  url.searchParams.set("orientation", "horizontal");
  url.searchParams.set("safesearch", "true");
  url.searchParams.set("per_page", "10");
  url.searchParams.set("min_width", "800");
  url.searchParams.set("category", "food");

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url.toString());
      if (!res.ok) {
        console.warn(`  ⚠️ Pixabay 返回 ${res.status}，重试 (${attempt}/${retries})`);
        await sleep(2000 * attempt);
        continue;
      }

      const data = (await res.json()) as PixabayResponse;

      if (data.totalHits === 0) {
        return null;
      }

      // 优先选大图、高分的
      const sorted = data.hits.sort(
        (a, b) =>
          b.imageWidth * b.imageHeight - a.imageWidth * a.imageHeight,
      );
      return sorted[0];
    } catch (err) {
      if (attempt < retries) {
        console.warn(`  ⚠️ 网络错误，重试 (${attempt}/${retries}):`, err);
        await sleep(2000 * attempt);
      } else {
        console.error(`  ❌ 搜索失败:`, err);
        return null;
      }
    }
  }
  return null;
}

// ============================================================
// 图片下载
// ============================================================

async function downloadImage(url: string, outputPath: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok || !res.body) {
      return false;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(outputPath, buffer);
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// 多关键词搜索（先用 queryCn，失败后降级）
// ============================================================

async function findImage(
  task: TaskRow,
  apiKey: string,
): Promise<{ url: string; source: string; author: string } | null> {
  // 先用英文关键词（Pixabay 英文搜索结果更准）
  const queries = [
    { q: task.queryEn, label: "en" },
    { q: `${task.name} food dish`, label: "name+food" },
    { q: task.queryCn, label: "cn" },
    { q: "Chinese food dish", label: "fallback" },
  ];

  for (const { q, label } of queries) {
    if (!q) continue;

    const hit = await searchPixabay(q, apiKey);
    if (hit) {
      console.log(`  📥 匹配 (${label}): "${q}" → ${hit.pageURL.split("/").pop()}`);
      return {
        url: hit.largeImageURL || hit.webformatURL,
        source: hit.pageURL,
        author: hit.user,
      };
    }
  }

  return null;
}

// ============================================================
// 主流程
// ============================================================

async function main() {
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) {
    console.error("❌ 需要设置 PIXABAY_API_KEY 环境变量");
    console.log("");
    console.log("💡 获取方式：");
    console.log("  1. 打开 https://pixabay.com/api/docs/");
    console.log("  2. 注册或登录账号");
    console.log("  3. 在 API 页面复制你的 Key");
    console.log("");
    console.log("💡 运行方式：");
    console.log("  PIXABAY_API_KEY=你的Key npx tsx scripts/download-product-images.ts");
    process.exit(1);
  }

  // 读取 CSV
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ 找不到 CSV: ${CSV_PATH}`);
    console.log("💡 请先运行: npx tsx scripts/generate-image-tasks.ts");
    process.exit(1);
  }

  const tasks = parseCsv(CSV_PATH);
  console.log(`📖 读取到 ${tasks.length} 道菜搜索任务\n`);

  // 确保输出目录存在
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(CANDIDATES_DIR, { recursive: true });

  // 统计
  let downloaded = 0;
  let skipped = 0;
  let failed: number[] = [];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const paddedId = String(task.id).padStart(3, "0");
    const outputPath = path.join(OUTPUT_DIR, `${paddedId}.jpg`);

    // 如果已经存在，跳过
    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  [${paddedId}/${task.name}] 已存在，跳过`);
      skipped++;
      continue;
    }

    console.log(`🔍 [${paddedId}/${task.name}] 搜索中...`);

    const result = await findImage(task, apiKey);

    if (!result) {
      console.log(`  ⚠️ 未找到匹配图片，跳过`);
      failed.push(task.id);
      await sleep(DELAY_MS);
      continue;
    }

    // 下载到临时路径
    const tempPath = path.join(CANDIDATES_DIR, `${paddedId}_original.jpg`);
    console.log(`  ⬇️  下载: ${result.url}`);

    const ok = await downloadImage(result.url, tempPath);
    if (!ok) {
      console.log(`  ❌ 下载失败，跳过`);
      failed.push(task.id);
      await sleep(DELAY_MS);
      continue;
    }

    // 处理为 800×800
    try {
      const info = await sharp(tempPath)
        .resize(800, 800, { fit: "cover", position: "center" })
        .jpeg({ quality: 85, mozjpeg: true })
        .toFile(outputPath);

      // 删除临时文件
      fs.unlinkSync(tempPath);

      console.log(
        `  ✅ 已保存: ${outputPath} (${info.width}×${info.height}, ${(info.size / 1024).toFixed(0)}KB)` +
          ` | 来源: ${result.author} | ${result.source}`,
      );
      downloaded++;
    } catch (err) {
      console.error(`  ❌ 处理失败:`, err);
      failed.push(task.id);
    }

    // 请求间隔，避免被限速
    if (i < tasks.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // 输出报告
  console.log("\n" + "=".repeat(50));
  console.log("📊 下载报告");
  console.log("=".repeat(50));
  console.log(`   成功: ${downloaded}/${tasks.length}`);
  console.log(`   跳过: ${skipped}`);
  console.log(`   失败: ${failed.length}`);

  if (failed.length > 0) {
    console.log(`\n❌ 失败的 ID: ${failed.join(", ")}`);
    console.log("💡 可以手动搜索后放入 product_candidates_selected/，再运行：");
    console.log("   npx tsx scripts/process-product-images.ts");
  }

  console.log(`\n🎉 完成后推送代码即可在 Vercel 看到新图片`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((err) => {
  console.error("❌ 脚本异常:", err);
  process.exit(1);
});
