// src/services/staffService.js
const staffService = {
  async getAllStaff() {
    const response = await window.axios.get('/staff');
    return response.data;
  },

  async getStaffStats(id) {
    const response = await window.axios.get(`/staff/${id}/stats`);
    return response.data;
  },

  async getStaffSales(id, period = 'today') {
    const response = await window.axios.get(`/staff/${id}/sales?period=${period}`);
    return response.data;
  },

  async createStaff(staffData) {
    const response = await window.axios.post('/staff/create', staffData);
    return response.data;
  },

  async updateStaff(id, staffData) {
    const response = await window.axios.put(`/staff/${id}`, staffData);
    return response.data;
  },

  async deleteStaff(id) {
    const response = await window.axios.delete(`/staff/${id}`);
    return response.data;
  },

  async toggleStaffStatus(id) {
    const response = await window.axios.patch(`/staff/${id}/toggle`);
    return response.data;
  }
};

export default staffService;