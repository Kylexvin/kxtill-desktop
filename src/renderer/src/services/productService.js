// src/services/productService.js
const productService = {
  async getAllProducts() {
    const response = await window.axios.get('/products');
    return response.data.products;
  },

  async createProduct(productData) {
    const response = await window.axios.post('/products/create', productData);
    return response.data;
  },

  async updateProduct(productId, productData) {
    const response = await window.axios.put(`/products/${productId}`, productData);
    return response.data;
  },

  async deleteProduct(productId) {
    const response = await window.axios.delete(`/products/${productId}`);
    return response.data;
  }
};

export default productService;