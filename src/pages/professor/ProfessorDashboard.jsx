import { useState, useEffect } from 'react';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../contexts/AuthContext';
import { FolderKanban, Users, CheckCircle, Clock } from 'lucide-react';

const ProfessorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalStudents: 0,
    pendingEvaluations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const projects = await projectService.getProfessorProjects(user?.id);
        const activeProjects = projects.filter((p) => p.status === 'in_progress').length;
        const pendingTasks = projects.reduce((acc, p) => {
          return acc + (p.pendingTasksCount || 0);
        }, 0);

        // Compter les étudiants uniques
        const uniqueStudents = new Set(
          projects.flatMap((p) => p.students?.map((s) => s.id) || [])
        );

        setStats({
          totalProjects: projects.length,
          activeProjects,
          totalStudents: uniqueStudents.size,
          pendingEvaluations: pendingTasks,
        });
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchStats();
    }
  }, [user]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Dashboard Professeur - {user?.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
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
            href="/professor/projects"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Voir mes Projets</h3>
            <p className="text-sm text-gray-600 mt-1">Consulter tous vos projets</p>
          </a>
          <a
            href="/professor/evaluations"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Évaluations</h3>
            <p className="text-sm text-gray-600 mt-1">Évaluer les tâches et rapports</p>
          </a>
          <a
            href="/professor/students"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Mes Étudiants</h3>
            <p className="text-sm text-gray-600 mt-1">Suivre vos étudiants</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfessorDashboard;

