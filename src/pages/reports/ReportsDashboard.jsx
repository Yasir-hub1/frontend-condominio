import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsService } from '../../api/servicesWithToast';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionGate from '../../components/PermissionGate';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Shield, 
  Clock,
  Download,
  Eye,
  Filter
} from 'lucide-react';

const ReportsDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { canPerformAction } = usePermissions();

  const reportCategories = [
    {
      title: 'Reportes Financieros',
      icon: DollarSign,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      reports: [
        {
          name: 'Envejecimiento de Deuda',
          description: 'Análisis de deudas por antigüedad',
          endpoint: 'getAgingDebt',
          icon: TrendingUp
        },
        {
          name: 'Tasa de Cobranza',
          description: 'Porcentaje de cobranza por período',
          endpoint: 'getCollectionRate',
          icon: BarChart3
        },
        {
          name: 'Top Deudores',
          description: 'Lista de mayores deudores',
          endpoint: 'getTopDebtors',
          icon: Users
        }
      ]
    },
    {
      title: 'Reportes de Seguridad',
      icon: Shield,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      reports: [
        {
          name: 'Estadísticas de Acceso',
          description: 'Análisis de entradas y salidas',
          endpoint: 'getAccessStatistics',
          icon: BarChart3
        },
        {
          name: 'Resumen de Incidentes',
          description: 'Reporte de incidentes de seguridad',
          endpoint: 'getIncidentSummary',
          icon: Shield
        }
      ]
    },
    {
      title: 'Reportes de Amenidades',
      icon: Users,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      reports: [
        {
          name: 'Estadísticas de Uso',
          description: 'Uso de amenidades por período',
          endpoint: 'getUsageStatistics',
          icon: BarChart3
        },
        {
          name: 'Tasa de Ocupación',
          description: 'Ocupación de amenidades',
          endpoint: 'getOccupancyRate',
          icon: TrendingUp
        }
      ]
    },
    {
      title: 'Reportes de Mantenimiento',
      icon: Clock,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      reports: [
        {
          name: 'Cumplimiento Preventivo',
          description: 'Tareas de mantenimiento completadas',
          endpoint: 'getPreventiveCompliance',
          icon: Clock
        },
        {
          name: 'Análisis de Costos',
          description: 'Costos de mantenimiento por categoría',
          endpoint: 'getCostAnalysis',
          icon: DollarSign
        }
      ]
    }
  ];

  const handleGenerateReport = async (endpoint, reportName) => {
    try {
      setLoading(true);
      const response = await reportsService[endpoint]({});
      console.log(`${reportName} report:`, response.data);
      // Aquí podrías mostrar el reporte en un modal o nueva página
    } catch (error) {
      console.error(`Error generating ${reportName} report:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (endpoint, reportName) => {
    try {
      setLoading(true);
      const response = await reportsService[endpoint]({ format: 'csv' });
      // Aquí podrías descargar el archivo CSV
      console.log(`${reportName} CSV:`, response.data);
    } catch (error) {
      console.error(`Error exporting ${reportName} report:`, error);
    } finally {
      setLoading(false);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Reportes</h1>
          <p className="text-gray-600">Genera y exporta reportes de todos los módulos del sistema</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Exportar Todos
          </button>
        </div>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCategories.map((category, categoryIndex) => {
          const CategoryIcon = category.icon;
          return (
            <div key={categoryIndex} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className={`${category.bgColor} p-3 rounded-lg`}>
                  <CategoryIcon className={`h-6 w-6 ${category.textColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 ml-3">{category.title}</h3>
              </div>
              
              <div className="space-y-3">
                {category.reports.map((report, reportIndex) => {
                  const ReportIcon = report.icon;
                  return (
                    <div key={reportIndex} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <ReportIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <h4 className="font-medium text-gray-900">{report.name}</h4>
                            <p className="text-sm text-gray-500">{report.description}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleGenerateReport(report.endpoint, report.name)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Ver reporte"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleExportReport(report.endpoint, report.name)}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Exportar CSV"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <BarChart3 className="h-8 w-8 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Reporte Ejecutivo</h4>
            <p className="text-sm text-gray-500">Resumen general del condominio</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <Filter className="h-8 w-8 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Reportes Personalizados</h4>
            <p className="text-sm text-gray-500">Crea reportes con filtros específicos</p>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <Download className="h-8 w-8 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Exportar Datos</h4>
            <p className="text-sm text-gray-500">Exporta todos los datos del sistema</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
