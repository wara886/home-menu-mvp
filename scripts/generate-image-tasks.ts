/**
 * scripts/generate-image-tasks.ts
 *
 * 从 src/data/dishes.json 读取 82 道菜，生成图片搜索任务 CSV。
 * 输出：public/image_sources/image_tasks.csv
 *
 * 运行方式：
 *   npx tsx scripts/generate-image-tasks.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DISHES_JSON = path.join(ROOT, "src/data/dishes.json");
const OUTPUT_CSV = path.join(ROOT, "public/image_sources/image_tasks.csv");

type Dish = {
  id: number;
  name: string;
  category: string;
  tags: string[];
};

/**
 * 根据菜名和分类生成中文搜索关键词
 */
function buildQueryCn(name: string, category: string): string {
  const catKeywords: Record<string, string> = {
    "鸡蛋类": "家常菜",
    "素菜豆制品": "素食",
    "猪肉排骨": "猪肉菜",
    "牛羊肉": "牛羊肉菜",
    "鸡鸭": "禽肉菜",
    "水产海鲜": "海鲜菜",
    "汤羹": "汤品",
    "主食": "主食",
  };

  const cat = catKeywords[category] ?? "家常菜";
  return `${name} ${cat} 成品图 高清 无水印`;
}

/**
 * 根据菜名生成英文搜索关键词
 */
function buildQueryEn(name: string): string {
  // 常见菜名英译对照
  const knownTranslations: Record<string, string> = {
    "西红柿炒鸡蛋": "Chinese tomato scrambled eggs dish",
    "酸辣土豆丝": "Chinese hot and sour shredded potato",
    "青椒炒五花肉": "Chinese green pepper stir fry pork belly",
    "红烧鸡翅": "Chinese braised chicken wings",
    "酸辣娃娃菜": "Chinese hot and sour baby cabbage",
    "豆角炒五花肉": "Chinese green bean stir fry pork belly",
    "鱼香肉丝": "Chinese Yu Xiang shredded pork (Fish fragrant pork)",
    "香辣花甲": "Chinese spicy clams",
    "小鸡炖蘑菇": "Chinese chicken stew with mushroom",
    "韭菜炒鸡蛋": "Chinese chive and egg stir fry",
    "葱花炒鸡蛋": "Chinese scallion scrambled eggs",
    "青椒火腿肠炒鸡蛋": "Chinese green pepper ham egg stir fry",
    "洋葱炒鸡蛋": "Chinese onion scrambled eggs",
    "蒜苔炒鸡蛋": "Chinese garlic stem scrambled eggs",
    "胡萝卜炒鸡蛋": "Chinese carrot scrambled eggs",
    "肉末蒸蛋": "Chinese steamed egg with minced pork",
    "麻婆豆腐": "Chinese Mapo Tofu",
    "葱烧豆腐": "Chinese braised tofu with scallion",
    "香煎豆腐": "Chinese pan-fried tofu",
    "家常豆腐": "Chinese home-style tofu",
    "番茄炒菜花": "Chinese tomato stir fry cauliflower",
    "干锅包菜": "Chinese dry pot cabbage",
    "清炒小白菜": "Chinese stir fry bok choy",
    "醋溜白菜": "Chinese vinegar cabbage",
    "蒜蓉西蓝花": "Chinese garlic broccoli",
    "白灼生菜": "Chinese blanched lettuce",
    "红烧茄子": "Chinese braised eggplant",
    "地三鲜": "Chinese Di San Xian (three treasure vegetable)",
    "干煸四季豆": "Chinese dry fried green beans",
    "酸辣绿豆芽": "Chinese hot and sour bean sprouts",
    "回锅肉": "Chinese Twice Cooked Pork (Hui Guo Rou)",
    "红烧肉": "Chinese Braised Pork Belly (Hong Shao Rou)",
    "辣椒炒肉": "Chinese pepper stir fry pork",
    "蒜苔炒肉": "Chinese garlic stem stir fry pork",
    "鱼香肉丝2": "Chinese Yu Xiang shredded pork",
    "土豆炖排骨": "Chinese potato stew spare ribs",
    "糖醋排骨": "Chinese sweet and sour spare ribs",
    "玉米排骨汤": "Chinese corn spare ribs soup",
    "冬瓜排骨汤": "Chinese winter melon spare ribs soup",
    "黄豆焖猪蹄": "Chinese soy bean braised pork trotters",
    "爆炒猪肝": "Chinese stir fry pork liver",
    "水煮肉片": "Chinese Shuizhu pork (Water boiled pork slices)",
    "小炒肉": "Chinese small stir fry pork",
    "孜然牛肉": "Chinese cumin beef",
    "水煮牛肉": "Chinese Shuizhu beef",
    "西红柿牛腩": "Chinese tomato beef brisket",
    "葱爆牛肉": "Chinese scallion beef stir fry",
    "白切羊肉": "Chinese boiled lamb",
    "大盘鸡": "Chinese Da Pan Ji (Big Plate Chicken)",
    "土豆炖鸡块": "Chinese potato stew chicken",
    "可乐鸡翅": "Chinese cola chicken wings",
    "香菇滑鸡": "Chinese mushroom steamed chicken",
    "宫保鸡丁": "Chinese Kung Pao Chicken",
    "辣子鸡": "Chinese La Zi Ji (Spicy chicken)",
    "啤酒鸭": "Chinese beer duck",
    "清蒸鲈鱼": "Chinese steamed sea bass",
    "红烧鱼块": "Chinese braised fish chunks",
    "糖醋鱼": "Chinese sweet and sour fish",
    "酸菜鱼": "Chinese Suan Cai Yu (Sour cabbage fish)",
    "剁椒鱼头": "Chinese chopped chili fish head",
    "油焖大虾": "Chinese braised prawns",
    "白灼虾": "Chinese blanched shrimp",
    "蒜蓉粉丝蒸虾": "Chinese garlic vermicelli steamed shrimp",
    "爆炒鱿鱼": "Chinese stir fry squid",
    "葱姜炒花蟹": "Chinese ginger scallion crab",
    "西红柿鸡蛋汤": "Chinese tomato egg drop soup",
    "紫菜蛋花汤": "Chinese seaweed egg drop soup",
    "玉米排骨汤2": "Chinese corn pork ribs soup",
    "冬瓜排骨汤2": "Chinese winter melon pork ribs soup",
    "酸辣汤": "Chinese hot and sour soup",
    "番茄鸡蛋疙瘩汤": "Chinese tomato egg drop dough drop soup",
    "白米饭": "Chinese steamed white rice",
    "蛋炒饭": "Chinese egg fried rice",
    "扬州炒饭": "Chinese Yangzhou fried rice",
    "酱油炒饭": "Chinese soy sauce fried rice",
    "炒面": "Chinese chow mein stir fry noodles",
    "葱油面": "Chinese scallion oil noodles",
    "炸酱面": "Chinese Zhajiang noodles",
    "酸汤水饺": "Chinese sour soup dumplings",
    "葱油饼": "Chinese scallion pancake",
    "鸡蛋饼": "Chinese egg pancake",
  };

  return knownTranslations[name] ?? `Chinese ${name} dish`;
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function main() {
  if (!fs.existsSync(DISHES_JSON)) {
    console.error(`❌ 找不到 dishes.json: ${DISHES_JSON}`);
    process.exit(1);
  }

  const dishes: Dish[] = JSON.parse(fs.readFileSync(DISHES_JSON, "utf-8"));
  console.log(`📖 读取到 ${dishes.length} 道菜`);

  const headers = [
    "id",
    "name",
    "category",
    "query_cn",
    "query_en",
    "status",
    "source_url",
    "source_site",
    "license",
    "author",
    "local_path",
  ];

  const rows = dishes.map((dish) => {
    const queryCn = buildQueryCn(dish.name, dish.category);
    const queryEn = buildQueryEn(dish.name);
    const localPath = `public/images/products/${String(dish.id).padStart(3, "0")}.jpg`;

    return [
      String(dish.id),
      dish.name,
      dish.category,
      queryCn,
      queryEn,
      "pending",
      "",
      "",
      "",
      "",
      localPath,
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\n");

  fs.mkdirSync(path.dirname(OUTPUT_CSV), { recursive: true });
  fs.writeFileSync(OUTPUT_CSV, csvContent, "utf-8");

  console.log(`✅ 已生成: ${OUTPUT_CSV}`);
  console.log(`📊 共 ${rows.length} 条搜索任务`);
  console.log("\n💡 下一步：");
  console.log("  1. 用 query_cn / query_en 在免版权图库搜索图片");
  console.log("  2. 将选好的图片放入 public/images/product_candidates_selected/");
  console.log("  3. 命名规则：001.jpg 到 082.jpg");
  console.log("  4. 运行 npx tsx scripts/process-product-images.ts 统一处理");
}

main();
