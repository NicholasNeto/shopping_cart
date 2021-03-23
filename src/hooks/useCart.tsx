import axios from 'axios';
import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {

    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart)
    }

    return [];
  });

  const addProduct = async (productId: number) => {

    try {
      // TODO
      const resultStock = await api.get('http://localhost:3333/stock')
      const resultProducts = await api.get('http://localhost:3333/products')

      let produtc = resultProducts.data
        .find((item: Product) => item.id === productId);

      let stockOfProduct = resultStock.data
        .find((item: Stock) => item.id === productId);

      let dupplicatedProduct = cart.find((item: Product) => item.id === productId);
      if (dupplicatedProduct === undefined) {
        debugger
        console.log("Não tem produto com mesmo id")
        produtc.amount = 1;

        if (stockOfProduct.amount > produtc.amount) {
          setCart([
            ...cart,
            produtc
          ])
        }
      } else {
        dupplicatedProduct.amount += 1;

        if (stockOfProduct.amount > dupplicatedProduct.amount) {
          setCart([
            ...cart,
            produtc
          ])
        }

      }

    } catch {
      // TODO
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO

    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {

    debugger
    try {
      // TODO
      const resultResponse = await api.get('http://localhost:3333/products')
      const allProducts = resultResponse.data
      const product = allProducts.find((it: Product) => it.id === productId)
      product.amount += amount
      setCart([...cart, product])


    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
