import { useState, useEffect, useMemo, useCallback } from 'react';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../contexts/AuthContext';
import { FolderKanban, Users, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';

const ProfessorDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalStudents: 0,
    pendingEvaluations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboard = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const fetchedProjects = await projectService.getProfessorProjects();

      const activeProjects = fetchedProjects.filter((p) => p.status === 'in_progress').length;
      const pendingTasks = fetchedProjects.reduce((acc, p) => acc + (p.pendingTasksCount || 0), 0);
      const uniqueStudents = new Set(
        fetchedProjects.flatMap((p) => p.students?.map((s) => s.id) || [])
      );

      setProjects(Array.isArray(fetchedProjects) ? fetchedProjects : []);
      setStats({
        totalProjects: fetchedProjects.length,
        activeProjects,
        totalStudents: uniqueStudents.size,
        pendingEvaluations: pendingTasks,
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [user?.id, fetchDashboard]);

  const statCards = [
    {
      title: 'Mes Projets',
      value: stats.totalProjects,
      icon: FolderKanban,
      color: 'bg-blue-500',
    },
    {
      title: 'Projets Actifs',
      value: stats.activeProjects,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Étudiants',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Évaluations en Attente',
      value: stats.pendingEvaluations,
      icon: CheckCircle,
      color: 'bg-red-500',
    },
  ];

  const activeProjectsList = useMemo(() => {
    return projects.filter((project) => project?.status === 'in_progress');
  }, [projects]);

  const recentCompletedProjects = useMemo(() => {
    return projects
      .filter((project) => project?.status === 'completed')
      .sort((a, b) => new Date(b?.updated_at || 0) - new Date(a?.updated_at || 0))
      .slice(0, 5);
  }, [projects]);

  const upcomingDeadlines = useMemo(() => {
    return projects
      .filter((project) => project?.date_fin)
      .sort((a, b) => new Date(a.date_fin) - new Date(b.date_fin))
      .slice(0, 5);
  }, [projects]);

  const pendingTasks = useMemo(() => {
    const tasks = [];
    projects.forEach((project) => {
      (project?.tasks || []).forEach((task) => {
        if (['pending', 'in_progress', 'overdue'].includes(task?.status)) {
          tasks.push({
            ...task,
            projectTitle: project?.titre,
          });
        }
      });
    });
    return tasks
      .sort((a, b) => new Date(a?.date_fin || Infinity) - new Date(b?.date_fin || Infinity))
      .slice(0, 6);
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
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Professeur - {user?.name}
        </h1>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 space-y-3">
                <Skeleton className="h-5 w-48" />
                {Array.from({ length: 4 }).map((__, subIdx) => (
                  <Skeleton key={subIdx} className="h-4 w-full" />
                ))}
              </div>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Projets actifs</h2>
              <div className="space-y-3">
                {activeProjectsList.length === 0 ? (
                  <p className="text-sm text-gray-500">Aucun projet actif pour le moment.</p>
                ) : (
                  activeProjectsList.map((project) => (
                    <div key={project?.id} className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{project?.titre}</p>
                        <p className="text-xs text-gray-500">
                          Groupes : {project?.nb_groupes ?? project?.groupes?.length ?? 0} • Sujets :{' '}
                          {project?.nb_sujets ?? project?.sujets?.length ?? 0}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-blue-600">
                        {formatDate(project?.date_fin)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Projets terminés récemment</h2>
              <div className="space-y-3">
                {recentCompletedProjects.length === 0 ? (
                  <p className="text-sm text-gray-500">Aucun projet terminé récemment.</p>
                ) : (
                  recentCompletedProjects.map((project) => (
                    <div key={project?.id} className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{project?.titre}</p>
                        <p className="text-xs text-gray-500">
                          Clôturé le {formatDate(project?.updated_at || project?.date_fin)}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-green-600">Terminé</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Échéances à venir</h2>
              {upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune échéance à venir.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.map((project) => (
                    <div key={project?.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{project?.titre}</p>
                        <p className="text-xs text-gray-500">
                          Étudiants : {project?.students?.length ?? project?.etudiants?.length ?? 0}
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

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tâches à traiter</h2>
              {pendingTasks.length === 0 ? (
                <p className="text-sm text-gray-500">Toutes les tâches sont à jour.</p>
              ) : (
                <div className="space-y-3">
                  {pendingTasks.map((task) => (
                    <div key={task?.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{task?.nom || task?.titre}</p>
                        <p className="text-xs text-gray-500">
                          Projet : {task?.projectTitle || '—'}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-amber-600">
                        {formatDate(task?.date_fin)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfessorDashboard;

