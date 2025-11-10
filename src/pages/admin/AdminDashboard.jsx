import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { projectService } from '../../services/projectService';
import { Users, FolderKanban, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import Breadcrumbs from '../../components/common/Breadcrumbs';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, projects] = await Promise.all([
          userService.getAllUsers(),
          projectService.getAllProjects(),
        ]);

        const activeProjects = projects.filter((p) => p.status === 'in_progress').length;
        const completedProjects = projects.filter((p) => p.status === 'completed').length;

        setStats({
          totalUsers: users.length,
          totalProjects: projects.length,
          activeProjects,
          completedProjects,
        });
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: 'Total Utilisateurs',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Projets',
      value: stats.totalProjects,
      icon: FolderKanban,
      color: 'bg-green-500',
    },
    {
      title: 'Projets Actifs',
      value: stats.activeProjects,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Projets Terminés',
      value: stats.completedProjects,
      icon: CheckCircle,
      color: 'bg-purple-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Breadcrumbs />
      </div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrateur</h1>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          {lastUpdated && <span>Mis à jour: {lastUpdated.toLocaleTimeString('fr-FR')}</span>}
          <Button size="sm" variant="outline" className="gap-2" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/users"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Gérer les Utilisateurs</h3>
            <p className="text-sm text-gray-600 mt-1">Créer et modifier les comptes</p>
          </a>
          <a
            href="/admin/projects"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Gérer les Projets</h3>
            <p className="text-sm text-gray-600 mt-1">Créer et assigner des projets</p>
          </a>
          <a
            href="/admin/settings"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Paramètres</h3>
            <p className="text-sm text-gray-600 mt-1">Configuration du système</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

