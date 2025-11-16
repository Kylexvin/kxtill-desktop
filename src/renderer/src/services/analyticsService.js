// src/services/analyticsService.js
const analyticsService = {
  async getDashboardData(period = 'today') {
    try {
      const response = await window.axios.get(`/analytics/complete?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },

  async getComprehensiveAnalytics(period = '7d') {
    try {
      const response = await window.axios.get(`/analytics/comprehensive?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comprehensive analytics:', error);
      throw error;
    }
  },

  async getLowStockData(threshold = 10) {
    try {
      const response = await window.axios.get(`/analytics/low-stock?threshold=${threshold}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock data:', error);
      throw error;
    }
  }
};

export default analyticsService;