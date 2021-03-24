import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  amount: number;
  productId: number;
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
      const resultStock = await api.get<Stock>(`http://localhost:3333/stock/${productId}`)
      let stockOfProduct = resultStock.data

      let position = cart.findIndex((item: Product) => item.id === productId);

      if (position === -1) {
        if (stockOfProduct.amount < 1) {
          toast.error('Quantidade solicitada fora de estoque')
        } else {
          const resultProducts = await api.get<Product>(`http://localhost:3333/products/${productId}`)
          let product = resultProducts.data
          if (!product.hasOwnProperty('id')) {
            throw new Error('Erro na adição do produto')
          }
          product.amount = 1;
          setCart([...cart, product])
          localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, product]));
        }
      }

      if (cart[position]) {
        if (stockOfProduct.amount < cart[position].amount + 1) {
          toast.error('Quantidade solicitada fora de estoque')
        } else {
          cart[position].amount = cart[position].amount + 1
          setCart([...cart])
          localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart]));
        }
      }
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      if (cart.findIndex(it => it.id === productId) === -1) { return toast.error('Erro na remoção do produto') }
      setCart([...cart.filter(it => it.id !== productId)])
      localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart.filter(it => it.id !== productId)]));
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {

    try {
      if (amount <= 0)
        throw new Error('Erro na alteração de quantidade do produto')

      const resultStock = await api.get(`http://localhost:3333/stock/${productId}`)
      const stockOfProduct = resultStock.data

      if (stockOfProduct.amount >= amount) {
        let position = cart.findIndex((it: Product) => it.id === productId);
        if (position > -1) {
          cart[position].amount = amount
          setCart([...cart])
          localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart]));
        }
      } else {
        toast.error('Quantidade solicitada fora de estoque');
      }

    } catch {
      toast.error('Erro na alteração de quantidade do produto');
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
