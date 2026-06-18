export interface Dish {
  id: number;
  name: string;
  category: string;
  video_time_sec: number;
  video_time: string;
  cover_image: string;
  source_card_image: string;
  steps: string[];
  tags: string[];
  image_step_check?: string;
  /** 正式商品图路径（public/images/products/xxx.jpg），首页优先显示 */
  productImage?: string;
}

export interface CartItem {
  dishId: number;
  quantity: number;
  note: string;
}

export type OrderStatus = "pending" | "cooking" | "done";

export interface OrderItem {
  dishId: number;
  name: string;
  category: string;
  quantity: number;
  coverImage: string;
  price: 0;
}

export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  remark: string;
  status: OrderStatus;
  totalPrice: 0;
  createdAt: string;
  updatedAt?: string;
}
