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
- 菜品图片仍然使用 `public/images/covers` 和 `public/images/recipe_cards`
- 购物车仍然使用浏览器 `localStorage`
- 订单数据使用 Supabase `orders` 表
- 当前没有登录、支付、通知
