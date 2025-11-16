// src/pages/Staff.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  X,
  Check,
  Clock
} from 'lucide-react';
import staffService from '../services/staffService';
import './Staff.css';

const Staff = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = async () => {
    try {
      setLoading(true);
      const data = await staffService.getAllStaff();
      setStaffData(data);
    } catch (error) {
      console.error('Failed to load staff data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staffData.filter(staff => {
    const matchesSearch = staff.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || staff.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = ['all', 'active', 'paused'];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active'
  });

  const handleAddStaff = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      status: 'active'
    });
    setShowStaffForm(true);
  };

  const handleEditStaff = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name || '',
      email: staff.email || '',
      phone: staff.phone || '',
      status: staff.status || 'active'
    });
    setShowStaffForm(true);
  };

  const handleDeleteStaff = async (staff) => {
    if (window.confirm(`Delete staff member ${staff.name}? This action cannot be undone.`)) {
      try {
        await staffService.deleteStaff(staff._id);
        await loadStaffData();
      } catch (error) {
        console.error('Failed to delete staff:', error);
        alert('Failed to delete staff member');
      }
    }
  };

  const handleStatusToggle = async (staff) => {
    try {
      await staffService.toggleStaffStatus(staff._id);
      await loadStaffData();
    } catch (error) {
      console.error('Failed to toggle staff status:', error);
      alert('Failed to update staff status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await staffService.updateStaff(editingStaff._id, {
          name: formData.name,
          phone: formData.phone
        });
      } else {
        await staffService.createStaff({
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        });
      }
      setShowStaffForm(false);
      await loadStaffData();
    } catch (error) {
      console.error('Failed to save staff:', error);
      alert('Failed to save staff member');
    }
  };

  const getRoleColor = (role) => {
    const safeRole = role || 'staff';
    switch (safeRole) {
      case 'owner': return '#dc2626';
      case 'staff': return '#059669';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'active' ? <Check size={12} /> : <Clock size={12} />;
  };

  const StaffForm = () => (
    <div className="modal-overlay" onClick={() => setShowStaffForm(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingStaff ? 'Edit Staff Member' : 'Add New Staff'}</h2>
          <button 
            onClick={() => setShowStaffForm(false)}
            className="close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="staff-form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter staff name"
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="staff@example.com"
                required
                disabled={!!editingStaff}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+254712345678"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => setShowStaffForm(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingStaff ? 'Update Staff' : 'Add Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const StaffCard = ({ staff }) => {
    const safeRole = staff.role || 'staff';
    const safeStatus = staff.status || 'active';
    const safeName = staff.name || 'Unknown Staff';
    const safeEmail = staff.email || 'No email';
    const safePhone = staff.phone || 'No phone';
    const safeCreatedAt = staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : 'Unknown date';

    return (
      <div className="staff-card">
        <div className="staff-header">
          <div className="staff-avatar">
            <User size={20} />
          </div>
          <div className="staff-actions">
            <button 
              onClick={() => handleEditStaff(staff)}
              className="btn-icon edit"
              title="Edit"
            >
              <Edit size={14} />
            </button>
            <button 
              onClick={() => handleDeleteStaff(staff)}
              className="btn-icon delete"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="staff-content">
          <h3 className="staff-name">{safeName}</h3>
          
          <div className="staff-details">
            <div className="detail-item">
              <Mail size={14} />
              <span>{safeEmail}</span>
            </div>
            {safePhone !== 'No phone' && (
              <div className="detail-item">
                <Phone size={14} />
                <span>{safePhone}</span>
              </div>
            )}
            <div className="detail-item">
              <Shield size={14} />
              <span className="staff-role" style={{ color: getRoleColor(safeRole) }}>
                {safeRole.charAt(0).toUpperCase() + safeRole.slice(1)}
              </span>
            </div>
            <div className="detail-item">
              <Calendar size={14} />
              <span>Joined: {safeCreatedAt}</span>
            </div>
          </div>

          <div className="staff-footer">
            <div className={`status-badge ${safeStatus}`}>
              {getStatusIcon(safeStatus)}
              <span>{safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}</span>
            </div>
            <button 
              onClick={() => handleStatusToggle(staff)}
              className={`status-toggle ${safeStatus}`}
            >
              {safeStatus === 'active' ? 'Pause' : 'Activate'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="staff">
        <div className="staff-header">
          <h1>Staff Management</h1>
          <p>Manage staff accounts and permissions</p>
        </div>
        <div className="loading-state">
          <p>Loading staff data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff">
      <div className="staff-header">
        <div className="header-left">
          <h1>Staff Management</h1>
          <p>Manage staff accounts and permissions</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleAddStaff}>
            <Plus size={16} />
            Add Staff
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="staff-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <User size={20} />
          </div>
          <div className="stat-content">
            <h3>{staffData.length}</h3>
            <p>Total Staff</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <Check size={20} />
          </div>
          <div className="stat-content">
            <h3>{staffData.filter(s => s.status === 'active').length}</h3>
            <p>Active Staff</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon paused">
            <Clock size={20} />
          </div>
          <div className="stat-content">
            <h3>{staffData.filter(s => s.status === 'paused').length}</h3>
            <p>Paused Staff</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="staff-controls">
        <div className="search-filter">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="status-filter"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="staff-grid">
        {filteredStaff.map(staff => (
          <StaffCard key={staff._id} staff={staff} />
        ))}

        {filteredStaff.length === 0 && (
          <div className="empty-state">
            <User size={48} />
            <p>No staff members found</p>
            <span>Try adjusting your search or add a new staff member</span>
            <button className="btn btn-primary" onClick={handleAddStaff}>
              <Plus size={16} />
              Add Your First Staff
            </button>
          </div>
        )}
      </div>

      {/* Staff Form Modal */}
      {showStaffForm && <StaffForm />}
    </div>
  );
};

export default Staff;