// src/services/staffService.js
const staffService = {
  async getAllStaff() {
    try {
      if (navigator.onLine) {
        // Online: Fetch from API and cache in SQLite
        const response = await window.axios.get('/staff');
        const staffData = response.data;
        
        // Cache staff data for offline use
        if (window.electronAPI?.database?.syncStaff) {
          await window.electronAPI.database.syncStaff(staffData);
        }
        
        return staffData;
      } else {
        // Offline: Get from local SQLite
        if (window.electronAPI?.database?.getStaff) {
          const localStaff = await window.electronAPI.database.getStaff();
          return localStaff;
        }
        throw new Error('No local staff data available offline');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      
      // Fallback to local data
      if (window.electronAPI?.database?.getStaff) {
        try {
          const localStaff = await window.electronAPI.database.getStaff();
          console.log('Using local staff data as fallback');
          return localStaff;
        } catch (localError) {
          console.error('Local staff also failed:', localError);
        }
      }
      
      throw error;
    }
  },

  async getStaffStats(id) {
    try {
      if (navigator.onLine) {
        // Online: Fetch from API
        const response = await window.axios.get(`/staff/${id}/stats`);
        
        // Cache stats locally
        if (window.electronAPI?.database?.cacheStaffStats) {
          await window.electronAPI.database.cacheStaffStats(id, response.data);
        }
        
        return response.data;
      } else {
        // Offline: Calculate from local sales data
        if (window.electronAPI?.database?.getStaffStats) {
          const localStats = await window.electronAPI.database.getStaffStats(id);
          return localStats;
        }
        
        // Fallback: return basic offline stats
        return {
          totalSales: 0,
          totalRevenue: 0,
          averageSale: 0,
          todaySales: 0,
          todayRevenue: 0
        };
      }
    } catch (error) {
      console.error('Error fetching staff stats:', error);
      
      // Fallback strategies
      if (window.electronAPI?.database?.getStaffStats) {
        try {
          return await window.electronAPI.database.getStaffStats(id);
        } catch (localError) {
          console.error('Local staff stats also failed:', localError);
        }
      }
      
      // Return minimal offline data
      return {
        totalSales: 0,
        totalRevenue: 0,
        averageSale: 0,
        todaySales: 0,
        todayRevenue: 0,
        offline: true
      };
    }
  },

  async getStaffSales(id, period = 'today') {
    try {
      if (navigator.onLine) {
        const response = await window.axios.get(`/staff/${id}/sales?period=${period}`);
        
        // Cache staff sales locally
        if (window.electronAPI?.database?.cacheStaffSales) {
          await window.electronAPI.database.cacheStaffSales(id, period, response.data);
        }
        
        return response.data;
      } else {
        // Offline: Get from local SQLite sales data
        if (window.electronAPI?.database?.getStaffSales) {
          const localSales = await window.electronAPI.database.getStaffSales(id, period);
          return localSales;
        }
        
        // Fallback: empty sales array
        return { sales: [], total: 0, count: 0 };
      }
    } catch (error) {
      console.error('Error fetching staff sales:', error);
      
      if (window.electronAPI?.database?.getStaffSales) {
        try {
          return await window.electronAPI.database.getStaffSales(id, period);
        } catch (localError) {
          console.error('Local staff sales also failed:', localError);
        }
      }
      
      return { sales: [], total: 0, count: 0, offline: true };
    }
  },

  async createStaff(staffData) {
    try {
      // Generate temporary ID for offline use
      const tempId = `staff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const staffWithTempId = {
        ...staffData,
        id: tempId,
        isLocal: true,
        synced: false,
        createdAt: new Date().toISOString()
      };
      
      // First create locally for immediate response
      if (window.electronAPI?.database?.createStaff) {
        const localStaff = await window.electronAPI.database.createStaff(staffWithTempId);
        
        // If online, also create via API
        if (navigator.onLine) {
          try {
            const response = await window.axios.post('/staff/create', staffData);
            const apiStaff = response.data;
            
            // Update local record with real ID from API
            if (window.electronAPI?.database?.updateStaffId) {
              await window.electronAPI.database.updateStaffId(tempId, apiStaff.id);
            }
            
            return apiStaff;
          } catch (apiError) {
            console.error('API staff creation failed, keeping local:', apiError);
            // Mark for sync later
            if (window.electronAPI?.database?.markStaffForSync) {
              await window.electronAPI.database.markStaffForSync(tempId, 'create', staffData);
            }
            return localStaff;
          }
        } else {
          // Offline: mark for sync creation later
          if (window.electronAPI?.database?.markStaffForSync) {
            await window.electronAPI.database.markStaffForSync(tempId, 'create', staffData);
          }
          return localStaff;
        }
      } else {
        // Fallback: direct API call
        const response = await window.axios.post('/staff/create', staffData);
        return response.data;
      }
    } catch (error) {
      console.error('Error creating staff:', error);
      throw error;
    }
  },

  async updateStaff(id, staffData) {
    try {
      // First update locally for immediate response
      if (window.electronAPI?.database?.updateStaff) {
        const localUpdate = await window.electronAPI.database.updateStaff(id, staffData);
        
        // If online, also update the API
        if (navigator.onLine) {
          try {
            const response = await window.axios.put(`/staff/${id}`, staffData);
            
            // Mark local update as synced
            if (window.electronAPI?.database?.markStaffSynced) {
              await window.electronAPI.database.markStaffSynced(id);
            }
            
            return response.data;
          } catch (apiError) {
            console.error('API staff update failed, keeping local changes:', apiError);
            // Mark for sync later
            if (window.electronAPI?.database?.markStaffForSync) {
              await window.electronAPI.database.markStaffForSync(id, 'update', staffData);
            }
            return localUpdate;
          }
        } else {
          // Offline: mark for sync update later
          if (window.electronAPI?.database?.markStaffForSync) {
            await window.electronAPI.database.markStaffForSync(id, 'update', staffData);
          }
          return localUpdate;
        }
      } else {
        // Fallback: direct API call
        const response = await window.axios.put(`/staff/${id}`, staffData);
        return response.data;
      }
    } catch (error) {
      console.error('Error updating staff:', error);
      throw error;
    }
  },

  async deleteStaff(id) {
    try {
      // First mark as deleted locally (soft delete)
      if (window.electronAPI?.database?.deleteStaff) {
        const localDelete = await window.electronAPI.database.deleteStaff(id);
        
        // If online, also delete from API
        if (navigator.onLine) {
          try {
            const response = await window.axios.delete(`/staff/${id}`);
            
            // Permanently remove from local DB after successful API deletion
            if (window.electronAPI?.database?.permanentlyDeleteStaff) {
              await window.electronAPI.database.permanentlyDeleteStaff(id);
            }
            
            return response.data;
          } catch (apiError) {
            console.error('API staff deletion failed, keeping local deletion:', apiError);
            // Mark for sync deletion later
            if (window.electronAPI?.database?.markStaffForSync) {
              await window.electronAPI.database.markStaffForSync(id, 'delete');
            }
            return localDelete;
          }
        } else {
          // Offline: mark for sync deletion later
          if (window.electronAPI?.database?.markStaffForSync) {
            await window.electronAPI.database.markStaffForSync(id, 'delete');
          }
          return localDelete;
        }
      } else {
        // Fallback: direct API call
        const response = await window.axios.delete(`/staff/${id}`);
        return response.data;
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      throw error;
    }
  },

  async toggleStaffStatus(id) {
    try {
      // First toggle locally for immediate response
      if (window.electronAPI?.database?.toggleStaffStatus) {
        const localToggle = await window.electronAPI.database.toggleStaffStatus(id);
        
        // If online, also toggle via API
        if (navigator.onLine) {
          try {
            const response = await window.axios.patch(`/staff/${id}/toggle`);
            
            // Sync local status with API
            if (window.electronAPI?.database?.syncStaffStatus) {
              await window.electronAPI.database.syncStaffStatus(id, response.data.active);
            }
            
            return response.data;
          } catch (apiError) {
            console.error('API staff toggle failed, keeping local change:', apiError);
            // Mark for sync later
            if (window.electronAPI?.database?.markStaffForSync) {
              const staff = await window.electronAPI.database.getStaffById(id);
              await window.electronAPI.database.markStaffForSync(id, 'update', { 
                active: staff?.active 
              });
            }
            return localToggle;
          }
        } else {
          // Offline: mark for sync later
          if (window.electronAPI?.database?.markStaffForSync) {
            const staff = await window.electronAPI.database.getStaffById(id);
            await window.electronAPI.database.markStaffForSync(id, 'update', { 
              active: staff?.active 
            });
          }
          return localToggle;
        }
      } else {
        // Fallback: direct API call
        const response = await window.axios.patch(`/staff/${id}/toggle`);
        return response.data;
      }
    } catch (error) {
      console.error('Error toggling staff status:', error);
      throw error;
    }
  },

  // NEW: Get current logged-in staff (for offline sales attribution)
  async getCurrentStaff() {
    try {
      if (window.electronAPI?.database?.getCurrentStaff) {
        return await window.electronAPI.database.getCurrentStaff();
      }
      
      // Fallback: get from localStorage or first staff member
      const staffList = await this.getAllStaff();
      return staffList[0] || null;
    } catch (error) {
      console.error('Error getting current staff:', error);
      return null;
    }
  },

  // NEW: Set current staff for offline sales
  async setCurrentStaff(staffId) {
    try {
      if (window.electronAPI?.database?.setCurrentStaff) {
        await window.electronAPI.database.setCurrentStaff(staffId);
      }
      
      // Also set in localStorage as fallback
      localStorage.setItem('current_staff_id', staffId);
    } catch (error) {
      console.error('Error setting current staff:', error);
      throw error;
    }
  }
};

export default staffService;