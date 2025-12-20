import { db } from "@/db"
import { cartItems, products } from "@/db/schema"
import { desc, eq, gt } from "drizzle-orm"

export const getCartItemsCount = async () => {
  const cart = await getCartItems()
  const count = cart.itmes.reduce(
    (acc: number, item) => acc + Number(item.quantity), 0
  )

  return {
    count,
    total: cart.itmes.reduce(
      (acc: number, item) => acc + Number(item.price) * Number(item.quantity), 0
    )
  }
}

export const getCartItems = async () => {
  const cart = await db.select()
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .orderBy(desc(cartItems.createdAt))

  return {
    itmes: cart.map((item) => ({
      ...item.products,
      quantity: item.cart_items.quantity,
    }))
  }
}

export async function removeFromCart(productId: string) {
  await db.delete(cartItems).where(eq(cartItems.productId, productId))
  return await getCartItems()
}

export async function clearCart() {
  await db.delete(cartItems).where(gt(cartItems.quantity, 0))
  return await getCartItems()
}
