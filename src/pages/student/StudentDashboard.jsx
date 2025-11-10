import { useState, useEffect, useMemo, useCallback } from 'react';
import { projectService } from '../../services/projectService';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../contexts/AuthContext';
import { FolderKanban, CheckCircle, Clock, FileText, RefreshCw } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboard = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [fetchedProjects, fetchedTasks] = await Promise.all([
        projectService.getStudentProjects(),
        taskService.getStudentTasks(),
      ]);

      // Compter les tâches par statut
      const inProgressTasks = fetchedTasks.filter((t) => t.statut === 'in_progress').length;
      const completedTasks = fetchedTasks.filter((t) => 
        ['done', 'evaluated', 'completed'].includes(t.statut)
      ).length;
      const pendingTasks = fetchedTasks.filter((t) => 
        ['todo', 'pending', 'overdue'].includes(t.statut)
      ).length;

      setProjects(Array.isArray(fetchedProjects) ? fetchedProjects : []);
      setTasks(Array.isArray(fetchedTasks) ? fetchedTasks : []);
      setStats({
        totalProjects: fetchedProjects.length,
        inProgressTasks,
        completedTasks,
        pendingTasks,
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
      title: 'Tâches en Cours',
      value: stats.inProgressTasks,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: 'Tâches Terminées',
      value: stats.completedTasks,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Tâches en Attente',
      value: stats.pendingTasks,
      icon: FileText,
      color: 'bg-red-500',
    },
  ];

  const activeProjectsList = useMemo(
    () => projects.filter((project) => project?.status === 'in_progress'),
    [projects]
  );

  const inProgressTasksList = useMemo(() => {
    return tasks
      .filter((task) => task.statut === 'in_progress')
      .sort((a, b) => new Date(a?.date_fin || Infinity) - new Date(b?.date_fin || Infinity))
      .slice(0, 6);
  }, [tasks]);

  const pendingTasksList = useMemo(() => {
    return tasks
      .filter((task) => ['todo', 'pending', 'overdue'].includes(task?.statut))
      .sort((a, b) => new Date(a?.date_fin || Infinity) - new Date(b?.date_fin || Infinity))
      .slice(0, 6);
  }, [tasks]);

  const completedTasksList = useMemo(() => {
    return tasks
      .filter((task) => ['done', 'evaluated', 'completed'].includes(task?.statut))
      .sort((a, b) => new Date(b?.updated_at || b?.date_fin || 0) - new Date(a?.updated_at || a?.date_fin || 0))
      .slice(0, 6);
  }, [tasks]);

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
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Étudiant - {user?.name}
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mes projets actifs</h2>
              {activeProjectsList.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun projet en cours.</p>
              ) : (
                <div className="space-y-3">
                  {activeProjectsList.map((project) => (
                    <div key={project?.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{project?.titre}</p>
                        <p className="text-xs text-gray-500">
                          Professeur : {project?.prof?.nom || project?.prof?.name || '—'}
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tâches en cours</h2>
              {inProgressTasksList.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune tâche en cours.</p>
              ) : (
                <div className="space-y-3">
                  {inProgressTasksList.map((task) => (
                    <div key={task?.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{task?.nom || task?.titre}</p>
                        <p className="text-xs text-gray-500">
                          Projet : {task?.projet?.titre || '—'}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-yellow-600">
                        {formatDate(task?.date_fin)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tâches en attente</h2>
              {pendingTasksList.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune tâche en attente.</p>
              ) : (
                <div className="space-y-3">
                  {pendingTasksList.map((task) => (
                    <div key={task?.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{task?.nom || task?.titre}</p>
                        <p className="text-xs text-gray-500">
                          Projet : {task?.projet?.titre || '—'}
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
                          Groupe : {project?.groupe?.numero_groupe || '—'}
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tâches terminées</h2>
              {completedTasksList.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune tâche terminée.</p>
              ) : (
                <div className="space-y-3">
                  {completedTasksList.map((task) => (
                    <div key={task?.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{task?.nom || task?.titre}</p>
                        <p className="text-xs text-gray-500">
                          Projet : {task?.projet?.titre || '—'}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-green-600">
                        {formatDate(task?.updated_at || task?.date_fin)}
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

export default StudentDashboard;

