import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const produtos = await AsyncStorage.getItem('@products');

      if (produtos) setProducts(JSON.parse(produtos));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const exist = products.find(x => x.id === product.id);

      if (exist) {
        products.map(x => {
          if (x.id === product.id) {
            x.quantity++;
          }
          return x;
        });
        setProducts([...products]);

        await AsyncStorage.setItem('@products', JSON.stringify([...products]));
      } else {
        product.quantity = 1;
        setProducts([...products, product]);

        await AsyncStorage.setItem(
          '@products',
          JSON.stringify([...products, product]),
        );
      }
    },
    [setProducts, products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      products.find(x => {
        if (x.id === id) x.quantity++;
      });

      setProducts([...products]);
      await AsyncStorage.setItem('@products', JSON.stringify([...products]));
    },
    [products, setProducts],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const newProducts = products.filter(x => {
        if (x.id === id) x.quantity--;
        if (x.quantity > 0) return x;
      });

      setProducts([...newProducts]);
      await AsyncStorage.setItem('@products', JSON.stringify([...newProducts]));
    },
    [products, setProducts],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
