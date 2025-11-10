import { useState, useEffect, useMemo, useCallback } from 'react';
import { userService } from '../../services/userService';
import { projectService } from '../../services/projectService';
import { Users, FolderKanban, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { Skeleton } from '../../components/ui/skeleton';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedUsers, fetchedProjects] = await Promise.all([
        userService.getAllUsers(),
        projectService.getAllProjectsAdmin(),
      ]);

      const activeProjects = fetchedProjects.filter((p) => p.status === 'in_progress').length;
      const completedProjects = fetchedProjects.filter((p) => p.status === 'completed').length;

      setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
      setProjects(Array.isArray(fetchedProjects) ? fetchedProjects : []);
      setStats({
        totalUsers: fetchedUsers.length,
        totalProjects: fetchedProjects.length,
        activeProjects,
        completedProjects,
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

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

  const roleCounts = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        const role = user?.role || 'autre';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      },
      { admin: 0, prof: 0, etudiant: 0, autre: 0 }
    );
  }, [users]);

  const latestUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => {
        const dateA = new Date(a?.created_at || 0).getTime();
        const dateB = new Date(b?.created_at || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [users]);

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => {
        const dateA = new Date(a?.created_at || 0).getTime();
        const dateB = new Date(b?.created_at || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [projects]);

  const upcomingDeadlines = useMemo(() => {
    return projects
      .filter((project) => project?.date_fin)
      .sort((a, b) => new Date(a.date_fin) - new Date(b.date_fin))
      .slice(0, 5);
  }, [projects]);

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div>
      <div className="mb-4">
        <Breadcrumbs />
      </div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrateur</h1>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          {lastUpdated && <span>Mis à jour: {lastUpdated.toLocaleTimeString('fr-FR')}</span>}
          <Button size="sm" variant="outline" className="gap-2" onClick={fetchDashboard}>
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 space-y-3">
                <Skeleton className="h-5 w-40" />
                {Array.from({ length: 4 }).map((__, subIdx) => (
                  <Skeleton key={subIdx} className="h-4 w-full" />
                ))}
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mt-6 space-y-3">
            <Skeleton className="h-5 w-48" />
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={idx} className="h-4 w-full" />
            ))}
          </div>
        </>
      ) : (
        <>
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

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Répartition des rôles</h2>
              <div className="space-y-3">
                {[
                  { label: 'Administrateurs', value: roleCounts.admin ?? 0 },
                  { label: 'Professeurs', value: roleCounts.prof ?? 0 },
                  { label: 'Étudiants', value: roleCounts.etudiant ?? 0 },
                ].map((role) => (
                  <div key={role.label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{role.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{role.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Utilisateurs récents</h2>
              <div className="space-y-3">
                {latestUsers.length === 0 ? (
                  <p className="text-sm text-gray-500">Aucun utilisateur trouvé.</p>
                ) : (
                  latestUsers.map((user) => (
                    <div key={user?.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user?.nom || user?.name || 'Utilisateur'}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(user?.created_at)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Projets récents</h2>
              <div className="space-y-3">
                {recentProjects.length === 0 ? (
                  <p className="text-sm text-gray-500">Aucun projet disponible.</p>
                ) : (
                  recentProjects.map((project) => (
                    <div key={project?.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{project?.titre}</p>
                        <p className="text-xs text-gray-500">
                          {project?.prof?.nom || project?.prof?.name || 'Professeur inconnu'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {project?.status === 'completed' ? 'Terminé' : formatDate(project?.created_at)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Prochaines échéances</h2>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune échéance à venir.</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((project) => (
                  <div key={project?.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{project?.titre}</p>
                      <p className="text-xs text-gray-500">
                        Responsable : {project?.prof?.nom || project?.prof?.name || '—'}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-blue-600">
                      {formatDate(project?.date_fin)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

