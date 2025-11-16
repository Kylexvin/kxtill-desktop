import { useState, useEffect } from 'react';

const mockProducts = [
  { id: 1, name: 'Coca Cola 500ml', sellingPrice: 60, category: 'Beverages', quantity: 50, trackStock: true, needsCustomPrice: false },
  { id: 2, name: 'Bread White', sellingPrice: 55, category: 'Bakery', quantity: 30, trackStock: true, needsCustomPrice: false },
  { id: 3, name: 'Milk 500ml', sellingPrice: 65, category: 'Dairy', quantity: 25, trackStock: true, needsCustomPrice: false },
  { id: 4, name: 'Eggs (Tray)', sellingPrice: 320, category: 'Dairy', quantity: 15, trackStock: true, needsCustomPrice: false },
  { id: 5, name: 'Rice (Custom)', sellingPrice: 0, category: 'Grains', quantity: 0, trackStock: false, needsCustomPrice: true },
  { id: 6, name: 'Water 500ml', sellingPrice: 30, category: 'Beverages', quantity: 100, trackStock: true, needsCustomPrice: false },
  { id: 7, name: 'Sugar 1kg', sellingPrice: 150, category: 'Groceries', quantity: 20, trackStock: true, needsCustomPrice: false },
  { id: 8, name: 'Cooking Oil', sellingPrice: 280, category: 'Groceries', quantity: 12, trackStock: true, needsCustomPrice: false },
];

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  const loadProducts = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products,
    loading,
    loadProducts,
    categories
  };
};