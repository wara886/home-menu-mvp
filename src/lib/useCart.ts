"use client";

import { useEffect, useState } from "react";

import {
  addDishToCart,
  changeCartQuantity,
  clearCartItems,
  getCart,
  removeDishFromCart,
  saveCart,
} from "@/lib/orderStorage";
import type { CartItem } from "@/types";

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const persistCart = (nextCart: CartItem[]) => {
    setCart(nextCart);
    saveCart(nextCart);
  };

  const increment = (dishId: number) => {
    persistCart(addDishToCart(cart, dishId));
  };

  const setQuantity = (dishId: number, quantity: number) => {
    persistCart(changeCartQuantity(cart, dishId, quantity));
  };

  const decrement = (dishId: number) => {
    const currentQuantity = cart.find((item) => item.dishId === dishId)?.quantity ?? 0;
    persistCart(changeCartQuantity(cart, dishId, currentQuantity - 1));
  };

  const remove = (dishId: number) => {
    persistCart(removeDishFromCart(cart, dishId));
  };

  const clear = () => {
    persistCart(clearCartItems(cart));
  };

  return {
    cart,
    increment,
    decrement,
    remove,
    clear,
    setQuantity,
    setCart: persistCart,
  };
}
