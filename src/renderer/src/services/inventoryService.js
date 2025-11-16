// src/services/inventoryService.js
const inventoryService = {
  async getInventory() {
    const response = await window.axios.get('/products');
    return response.data.products;
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

export default inventoryService;