import React, { useState, useEffect } from 'react';
import { reportsService } from '../../api/servicesWithToast';
import { BarChart3, Download, Calendar, DollarSign, Users, Shield, Waves, Wrench } from 'lucide-react';

const Reports = () => {
  const [reports, setReports] = useState({
    finance: null,
    access: null,
    amenities: null,
    maintenance: null
  });
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const reportTypes = [
    {
      id: 'finance',
      name: 'Reporte de Morosidad',
      description: 'Análisis de pagos pendientes y morosidad',
      icon: DollarSign,
      color: 'bg-red-500',
      endpoint: 'getFinanceMorosity'
    },
    {
      id: 'access',
      name: 'Tendencias de Acceso',
      description: 'Estadísticas de acceso y seguridad',
      icon: Shield,
      color: 'bg-blue-500',
      endpoint: 'getAccessTrends'
    },
    {
      id: 'amenities',
      name: 'Uso de Amenidades',
      description: 'Análisis de uso de amenidades y reservas',
      icon: Waves,
      color: 'bg-green-500',
      endpoint: 'getAmenitiesUsage'
    },
    {
      id: 'maintenance',
      name: 'Resumen de Mantenimiento',
      description: 'Estadísticas de órdenes de trabajo y costos',
      icon: Wrench,
      color: 'bg-yellow-500',
      endpoint: 'getMaintenanceSummary'
    }
  ];

  const fetchReport = async (reportType) => {
    try {
      setLoading(true);
      const params = {
        start_date: dateRange.start,
        end_date: dateRange.end
      };

      let response;
      switch (reportType) {
        case 'finance':
          response = await reportsService.getFinanceMorosity(params);
          break;
        case 'access':
          response = await reportsService.getAccessTrends(params);
          break;
        case 'amenities':
          response = await reportsService.getAmenitiesUsage(params);
          break;
        case 'maintenance':
          response = await reportsService.getMaintenanceSummary(params);
          break;
        default:
          return;
      }

      setReports(prev => ({
        ...prev,
        [reportType]: response.data
      }));
    } catch (error) {
      console.error(`Error fetching ${reportType} report:`, error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (reportType, data) => {
    const reportName = reportTypes.find(r => r.id === reportType)?.name || 'Reporte';
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportName}_${dateRange.start}_${dateRange.end}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    if (!data || typeof data !== 'object') return '';
    
    const headers = Object.keys(data);
    const values = Object.values(data);
    
    let csv = headers.join(',') + '\n';
    csv += values.join(',') + '\n';
    
    return csv;
  };

  const renderReportData = (reportType, data) => {
    if (!data) return <p className="text-gray-500">No hay datos disponibles</p>;

    switch (reportType) {
      case 'finance':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-900">Total Morosidad</h4>
                <p className="text-2xl font-bold text-red-600">${data.total_debt || 0}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900">Unidades en Mora</h4>
                <p className="text-2xl font-bold text-yellow-600">{data.units_in_debt || 0}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Detalles por Unidad</h4>
              <div className="space-y-2">
                {data.unit_details?.map((unit, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{unit.unit_name}</span>
                    <span className="font-medium">${unit.debt_amount}</span>
                  </div>
                )) || <p className="text-gray-500">No hay detalles disponibles</p>}
              </div>
            </div>
          </div>
        );

      case 'access':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">Accesos Exitosos</h4>
                <p className="text-2xl font-bold text-green-600">{data.successful_accesses || 0}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-900">Accesos Fallidos</h4>
                <p className="text-2xl font-bold text-red-600">{data.failed_accesses || 0}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Total Accesos</h4>
                <p className="text-2xl font-bold text-blue-600">{data.total_accesses || 0}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Horarios de Mayor Acceso</h4>
              <div className="space-y-2">
                {data.peak_hours?.map((hour, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{hour.hour}:00</span>
                    <span className="font-medium">{hour.count} accesos</span>
                  </div>
                )) || <p className="text-gray-500">No hay datos de horarios</p>}
              </div>
            </div>
          </div>
        );

      case 'amenities':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">Total Reservas</h4>
                <p className="text-2xl font-bold text-green-600">{data.total_reservations || 0}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Amenidad Más Usada</h4>
                <p className="text-lg font-bold text-blue-600">{data.most_used_amenity || 'N/A'}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Uso por Amenidad</h4>
              <div className="space-y-2">
                {data.amenity_usage?.map((amenity, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{amenity.name}</span>
                    <span className="font-medium">{amenity.usage_count} reservas</span>
                  </div>
                )) || <p className="text-gray-500">No hay datos de uso</p>}
              </div>
            </div>
          </div>
        );

      case 'maintenance':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">Total Órdenes</h4>
                <p className="text-2xl font-bold text-blue-600">{data.total_orders || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900">Completadas</h4>
                <p className="text-2xl font-bold text-green-600">{data.completed_orders || 0}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900">Costo Total</h4>
                <p className="text-2xl font-bold text-yellow-600">${data.total_cost || 0}</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Órdenes por Estado</h4>
              <div className="space-y-2">
                {data.orders_by_status?.map((status, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="capitalize">{status.status}</span>
                    <span className="font-medium">{status.count}</span>
                  </div>
                )) || <p className="text-gray-500">No hay datos de estados</p>}
              </div>
            </div>
          </div>
        );

      default:
        return <p className="text-gray-500">Tipo de reporte no reconocido</p>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="text-gray-600">Genera reportes detallados del sistema</p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">Rango de fechas:</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-500">a</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const hasData = reports[report.id] !== null;
          
          return (
            <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-lg ${report.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-500">{report.description}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => fetchReport(report.id)}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generando...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generar Reporte
                    </>
                  )}
                </button>
                
                {hasData && (
                  <button
                    onClick={() => downloadReport(report.id, reports[report.id])}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar CSV
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Results */}
      {Object.entries(reports).map(([reportType, data]) => {
        if (!data) return null;
        
        const report = reportTypes.find(r => r.id === reportType);
        if (!report) return null;
        
        return (
          <div key={reportType} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${report.color}`}>
                  <report.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <h3 className="text-xl font-semibold text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-500">
                    Período: {dateRange.start} - {dateRange.end}
                  </p>
                </div>
              </div>
              <button
                onClick={() => downloadReport(reportType, data)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </button>
            </div>
            
            {renderReportData(reportType, data)}
          </div>
        );
      })}

      {/* No Reports Message */}
      {Object.values(reports).every(data => data === null) && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reportes generados</h3>
          <p className="text-gray-500">Selecciona un tipo de reporte y genera uno para ver los datos aquí.</p>
        </div>
      )}
    </div>
  );
};

export default Reports;
