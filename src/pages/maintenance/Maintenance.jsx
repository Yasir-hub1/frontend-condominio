import React, { useState, useEffect } from 'react';
import { maintenanceService } from '../../api/servicesWithToast';
import { Plus, Search, Edit, Trash2, Wrench, Clock, DollarSign, User, Calendar } from 'lucide-react';

const Maintenance = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [providers, setProviders] = useState([]);
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('work-orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    assigned_to: '',
    estimated_cost: '',
    actual_cost: '',
    work_order: '',
    cost_type: 'labor',
    amount: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [workOrdersRes, providersRes, costsRes] = await Promise.all([
        maintenanceService.getWorkOrders(),
        maintenanceService.getProviders(),
        maintenanceService.getWorkOrderCosts()
      ]);
      setWorkOrders(workOrdersRes.data.results);
      setProviders(providersRes.data.results);
      setCosts(costsRes.data.results);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'work-orders') {
        if (editingItem) {
          await maintenanceService.updateWorkOrder(editingItem.id, formData);
        } else {
          await maintenanceService.createWorkOrder(formData);
        }
      } else if (activeTab === 'providers') {
        if (editingItem) {
          await maintenanceService.updateProvider(editingItem.id, formData);
        } else {
          await maintenanceService.createProvider(formData);
        }
      } else {
        if (editingItem) {
          await maintenanceService.updateWorkOrderCost(editingItem.id, formData);
        } else {
          await maintenanceService.createWorkOrderCost(formData);
        }
      }
      fetchData();
      setShowModal(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      priority: item.priority || 'medium',
      status: item.status || 'pending',
      assigned_to: item.assigned_to || '',
      estimated_cost: item.estimated_cost || '',
      actual_cost: item.actual_cost || '',
      work_order: item.work_order || '',
      cost_type: item.cost_type || 'labor',
      amount: item.amount || '',
      name: item.name || '',
      contact_person: item.contact_person || '',
      phone: item.phone || '',
      email: item.email || '',
      address: item.address || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este elemento?')) {
      try {
        if (activeTab === 'work-orders') {
          await maintenanceService.deleteWorkOrder(id);
        } else if (activeTab === 'providers') {
          await maintenanceService.deleteProvider(id);
        } else {
          await maintenanceService.deleteWorkOrderCost(id);
        }
        fetchData();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      assigned_to: '',
      estimated_cost: '',
      actual_cost: '',
      work_order: '',
      cost_type: 'labor',
      amount: '',
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: ''
    });
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'providers': return providers;
      case 'costs': return costs;
      default: return workOrders;
    }
  };

  const filteredData = getCurrentData().filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'in_progress': return 'En Progreso';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Mantenimiento</h1>
          <p className="text-gray-600">Administra órdenes de trabajo, proveedores y costos</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo {activeTab === 'work-orders' ? 'Orden' : activeTab === 'providers' ? 'Proveedor' : 'Costo'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'work-orders', name: 'Órdenes de Trabajo', icon: Wrench },
            { id: 'providers', name: 'Proveedores', icon: User },
            { id: 'costs', name: 'Costos', icon: DollarSign }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={`Buscar ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          {activeTab === 'work-orders' && (
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="in_progress">En Progreso</option>
                <option value="completed">Completadas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  {activeTab === 'work-orders' ? (
                    <Wrench className="h-6 w-6 text-blue-600" />
                  ) : activeTab === 'providers' ? (
                    <User className="h-6 w-6 text-green-600" />
                  ) : (
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">{item.title || item.name}</h3>
                  <p className="text-sm text-gray-500">
                    {activeTab === 'work-orders' ? `Prioridad: ${getPriorityText(item.priority)}` : 
                     activeTab === 'providers' ? item.contact_person : 
                     `Tipo: ${item.cost_type}`}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p className="text-gray-900">{item.description}</p>
              
              {activeTab === 'work-orders' && (
                <>
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prioridad:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(item.priority)}`}>
                      {getPriorityText(item.priority)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Costo Estimado:</span>
                    <span>${item.estimated_cost}</span>
                  </div>
                </>
              )}

              {activeTab === 'providers' && (
                <>
                  <div className="flex justify-between">
                    <span>Contacto:</span>
                    <span>{item.contact_person}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Teléfono:</span>
                    <span>{item.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span>{item.email}</span>
                  </div>
                </>
              )}

              {activeTab === 'costs' && (
                <>
                  <div className="flex justify-between">
                    <span>Monto:</span>
                    <span className="font-medium">${item.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tipo:</span>
                    <span>{item.cost_type}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? 'Editar' : 'Nuevo'} {activeTab === 'work-orders' ? 'Orden de Trabajo' : activeTab === 'providers' ? 'Proveedor' : 'Costo'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {activeTab === 'work-orders' ? 'Título' : activeTab === 'providers' ? 'Nombre' : 'Descripción'}
                  </label>
                  <input
                    type="text"
                    value={formData.title || formData.name}
                    onChange={(e) => setFormData({...formData, [activeTab === 'providers' ? 'name' : 'title']: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                  />
                </div>

                {activeTab === 'work-orders' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Prioridad</label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({...formData, priority: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="low">Baja</option>
                          <option value="medium">Media</option>
                          <option value="high">Alta</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Estado</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="in_progress">En Progreso</option>
                          <option value="completed">Completada</option>
                          <option value="cancelled">Cancelada</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Costo Estimado</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.estimated_cost}
                          onChange={(e) => setFormData({...formData, estimated_cost: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Costo Real</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.actual_cost}
                          onChange={(e) => setFormData({...formData, actual_cost: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'providers' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Persona de Contacto</label>
                      <input
                        type="text"
                        value={formData.contact_person}
                        onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Dirección</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'costs' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Monto</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.amount}
                          onChange={(e) => setFormData({...formData, amount: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Costo</label>
                        <select
                          value={formData.cost_type}
                          onChange={(e) => setFormData({...formData, cost_type: e.target.value})}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="labor">Mano de Obra</option>
                          <option value="materials">Materiales</option>
                          <option value="equipment">Equipos</option>
                          <option value="other">Otros</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    {editingItem ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
