# Home Menu MVP

本项目是本地家庭点菜 MVP：菜品数据和图片仍然来自本地文件，订单数据使用 Supabase 同步。

## 环境变量

在项目根目录创建 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL="你的 Supabase Project URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="你的 Supabase anon public key"
```

如果缺少这两个变量，浏览器控制台会显示 Supabase 配置错误，订单提交和订单列表会失败。

新增可选变量：

```bash
ADMIN_PASSWORD="管理后台密码"        # 访问 /admin 时需要
BARK_KEY="你的Bark设备key"           # 新订单推送到 iPhone（选装 Bark App）
```

## Supabase orders 表

在 Supabase SQL Editor 中执行：

```sql
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text default '家里人',
  items jsonb not null,
  remark text default '',
  total_price numeric default 0,
  status text default 'pending',
  created_at timestamptz default now()
);

alter table public.orders enable row level security;

create policy "allow select orders"
on public.orders
for select
to anon
using (true);

create policy "allow insert orders"
on public.orders
for insert
to anon
with check (true);

create policy "allow update orders"
on public.orders
for update
to anon
using (true)
with check (true);
```

## 运行

```bash
npm install
npm run dev -- -H 0.0.0.0
```

Mac 本机访问：

```text
http://localhost:3000
```

手机和 Mac 在同一个 Wi-Fi 下，访问终端输出的 Network 地址，例如：

```text
http://192.168.3.75:3000
```

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 打开 [vercel.com](https://vercel.com)，Import 该仓库
3. 添加环境变量（与 `.env.local` 一致）：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_PASSWORD`
   - `BARK_KEY`
4. 点击 Deploy，等待完成
5. 获得公网地址（如 `https://home-menu-mvp.vercel.app`）

## 页面

- `/`：首页点菜
- `/cart`：确认下单
- `/order/success`：下单成功
- `/orders`：用户侧订单记录
- `/admin`：管理后台（需输入密码）

## 说明

- 菜品数据仍然使用 `src/data/dishes.json`
- 菜品图片逻辑：
  - 首页菜品卡片 **优先显示** `public/images/products/` 下的商品图
  - 没有商品图时自动回退 `public/images/covers/` 原封面图
  - 详情页继续保留 `coverImage`（封面大图）和 `sourceCardImage`（原始菜谱卡片截图）
  - `public/images/covers` 和 `public/images/recipe_cards` **不会被删除或覆盖**
- 购物车仍然使用浏览器 `localStorage`
- 订单数据使用 Supabase `orders` 表
- 当前没有登录、支付、通知

## 商品图替换流水线

### 目录结构

```
public/images/
├── covers/                          # 原有封面图（不动）
├── recipe_cards/                    # 原有菜谱截图（不动）
├── products/                        # 统一处理后的商品图（800×800 jpg）
├── product_candidates/              # 候选图临时存放
└── product_candidates_selected/     # 选中的待处理图（输入目录）
public/image_sources/
└── image_tasks.csv                  # 图片搜索任务清单
```

### 商品图命名规则

```
public/images/products/001.jpg   — id=1  西红柿炒鸡蛋
public/images/products/002.jpg   — id=2  酸辣土豆丝
...
public/images/products/082.jpg   — id=82 鸡蛋饼
```

### Step 1：生成搜索任务清单

```bash
npx tsx scripts/generate-image-tasks.ts
```

输出 `public/image_sources/image_tasks.csv`，每道菜包含：

| 字段 | 说明 |
|------|------|
| `query_cn` | 中文搜索词（如"西红柿炒鸡蛋 家常菜 成品图 高清 无水印"） |
| `query_en` | 英文搜索词（如"Chinese tomato scrambled eggs dish"） |
| `local_path` | 最终存放路径 |

### Step 2：在免版权图库搜索图片

**推荐图库（授权清晰）：**
- [Pexels](https://pexels.com) — CC0 / Pexels 许可
- [Pixabay](https://pixabay.com) — Pixabay 许可（大部分 CC0）
- [Unsplash](https://unsplash.com) — Unsplash 许可
- [Openverse](https://openverse.org) / Wikimedia Commons — CC 系列许可

**不建议使用：** 外卖平台、小红书、抖音、百度图片等来源不清晰的图片（版权风险）。

### Step 3：选图放入输入目录

将选好的图放入 `public/images/product_candidates_selected/`，命名规则：

```
001.jpg  002.jpg  003.jpg  ...  082.jpg
```

支持 `.jpg` `.jpeg` `.png` `.webp` 格式输入。

### Step 4：统一处理为商品图

```bash
npx tsx scripts/process-product-images.ts
```

处理结果：
- **输出**：`public/images/products/xxx.jpg`
- **尺寸**：800×800
- **格式**：JPEG quality 85（mozjpeg）
- **裁切**：center crop（object-cover 效果）
- **跳过**：没有输入图片的 ID 会打印 warning 并跳过
- **保留**：原始 covers 和 recipe_cards 不变

### 首页自动切换

- 如果 `public/images/products/xxx.jpg` 存在，首页自动显示商品图
- 不存在则显示原来的 `covers/xxx` 封面图
- 无需改代码，无需改 `dishes.json`
