/**
 * scripts/process-product-images.ts
 *
 * 将 public/images/product_candidates_selected/ 中的选中图片，
 * 统一处理为 800x800 jpg quality 85 center-crop，
 * 输出到 public/images/products/。
 *
 * 运行方式：
 *   npx tsx scripts/process-product-images.ts
 *
 * 输入命名要求：001.jpg ~ 082.jpg（与 dishes.json 中 id 对应）
 * 跳过不存在的编号。
 */

import * as fs from "node:fs";
import * as path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const INPUT_DIR = path.join(ROOT, "public/images/product_candidates_selected");
const OUTPUT_DIR = path.join(ROOT, "public/images/products");
const DISHES_JSON = path.join(ROOT, "src/data/dishes.json");

const TARGET_SIZE = 800;
const QUALITY = 85;
const TOTAL_DISHES = 82;

async function main() {
  // 检查输入目录
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`❌ 输入目录不存在: ${INPUT_DIR}`);
    console.log("💡 请先创建目录，放入选中的图片（命名 001.jpg ~ 082.jpg）");
    process.exit(1);
  }

  // 读取菜品列表，获取 id 和 name 映射
  let dishes: Array<{ id: number; name: string }> = [];
  if (fs.existsSync(DISHES_JSON)) {
    dishes = JSON.parse(fs.readFileSync(DISHES_JSON, "utf-8"));
  } else {
    console.warn("⚠️ 找不到 dishes.json，将只处理文件不验证菜品名");
  }

  const dishMap = new Map(dishes.map((d) => [d.id, d.name]));

  // 确保输出目录存在
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (let id = 1; id <= TOTAL_DISHES; id++) {
    const paddedId = String(id).padStart(3, "0");
    const dishName = dishMap.get(id) ?? "未知菜品";

    // 尝试多种扩展名
    let inputPath = "";
    for (const ext of [".jpg", ".jpeg", ".png", ".webp", ".avif"]) {
      const candidate = path.join(INPUT_DIR, `${paddedId}${ext}`);
      if (fs.existsSync(candidate)) {
        inputPath = candidate;
        break;
      }
    }

    if (!inputPath) {
      console.warn(`⚠️ [${paddedId}] ${dishName} — 未找到输入图片，跳过`);
      skipped++;
      continue;
    }

    const outputPath = path.join(OUTPUT_DIR, `${paddedId}.jpg`);

    try {
      const info = await sharp(inputPath)
        .resize(TARGET_SIZE, TARGET_SIZE, {
          fit: "cover",
          position: "center",
        })
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toFile(outputPath);

      const inputSize = fs.statSync(inputPath).size;
      const savedMb = ((inputSize - info.size) / 1024 / 1024).toFixed(2);

      console.log(
        `✅ [${paddedId}] ${dishName} — ` +
          `${info.width}x${info.height}, ` +
          `${(info.size / 1024).toFixed(0)}KB` +
          (inputSize > info.size ? ` (节省 ${savedMb}MB)` : ""),
      );
      processed++;
    } catch (err) {
      console.error(`❌ [${paddedId}] ${dishName} — 处理失败:`, err);
      errors++;
    }
  }

  console.log("\n📊 处理结果:");
  console.log(`   处理成功: ${processed}`);
  console.log(`   跳过:     ${skipped}`);
  console.log(`   失败:     ${errors}`);

  if (skipped > 0) {
    console.log(`\n💡 已跳过 ${skipped} 道菜，如需补齐请将图片放入:`);
    console.log(`   ${INPUT_DIR}`);
    console.log("   命名规则：001.jpg ~ 082.jpg");
  }
}

main().catch((err) => {
  console.error("❌ 脚本运行失败:", err);
  process.exit(1);
});
