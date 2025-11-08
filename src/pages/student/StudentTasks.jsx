import { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  LayoutGrid,
  List,
  Calendar,
  Calendar as CalendarIcon,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreVertical,
  Search,
  Filter,
  X,
  ChevronDown,
} from 'lucide-react';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-new';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Types de statut
const STATUS_TYPES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  OVERDUE: 'overdue',
  DONE: 'done',
};

// Priorités
const PRIORITIES = {
  HIGH: 'high',
  MID: 'mid',
  LOW: 'low',
};

// Couleurs pour les priorités
const PRIORITY_COLORS = {
  [PRIORITIES.HIGH]: 'bg-pink-100 text-pink-700 border-pink-200',
  [PRIORITIES.MID]: 'bg-orange-100 text-orange-700 border-orange-200',
  [PRIORITIES.LOW]: 'bg-blue-100 text-blue-700 border-blue-200',
};

const StudentTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    in_progress: 0,
    overdue: 0,
    done: 0,
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // board, list, calendar
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    nom: '',
    priorite: PRIORITIES.MID,
    projet_id: '',
    date_debut: '',
    date_fin: '',
  });
  
  // États pour les filtres
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'todo', 'in_progress', 'overdue', 'done'
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');

  // Charger les tâches et projets au montage
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [tasksData, projectsData, statsData] = await Promise.all([
          taskService.getStudentTasks(),
          projectService.getStudentProjects(),
          taskService.getStats(),
        ]);
        
        setTasks(tasksData);
        setStats(statsData);
        
        // Extraire les projets uniques de la liste des projets de l'étudiant
        const uniqueProjects = [];
        projectsData.forEach((projet) => {
          if (!uniqueProjects.find(p => p.id === projet.id)) {
            uniqueProjects.push({
              id: projet.id,
              titre: projet.titre,
            });
          }
        });
        setProjects(uniqueProjects);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);


  const handleAddTask = async () => {
    if (!newTask.nom.trim() || !newTask.projet_id) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const createdTask = await taskService.createTask({
        nom: newTask.nom,
        priorite: newTask.priorite,
        projet_id: parseInt(newTask.projet_id),
        date_debut: newTask.date_debut || null,
        date_fin: newTask.date_fin || null,
      });

      setTasks((prev) => [...prev, createdTask]);
      
      // Recharger les statistiques
      const statsData = await taskService.getStats();
      setStats(statsData);
      
      setNewTask({
        nom: '',
        priorite: PRIORITIES.MID,
        projet_id: '',
        date_debut: '',
        date_fin: '',
      });
      setIsNewTaskOpen(false);
      toast.success('Tâche créée avec succès');
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la création de la tâche');
    }
  };

  const handleEditTask = async () => {
    if (!editingTask || !editingTask.nom.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const updatedTask = await taskService.updateTask(editingTask.id, {
        nom: editingTask.nom,
        priorite: editingTask.priorite,
        projet_id: editingTask.projet_id,
        date_debut: editingTask.date_debut || null,
        date_fin: editingTask.date_fin || null,
      });

      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      
      // Recharger les statistiques
      const statsData = await taskService.getStats();
      setStats(statsData);
      
      setEditingTask(null);
      toast.success('Tâche modifiée avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour de la tâche');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;

    try {
      await taskService.deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      
      // Recharger les statistiques
      const statsData = await taskService.getStats();
      setStats(statsData);
      toast.success('Tâche supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression de la tâche');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const updatedTask = await taskService.updateStatus(taskId, newStatus);
      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      
      // Recharger les statistiques
      const statsData = await taskService.getStats();
      setStats(statsData);
      toast.success('Statut de la tâche mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case STATUS_TYPES.IN_PROGRESS:
        return 'border-t-2 border-t-orange-500';
      case STATUS_TYPES.OVERDUE:
        return 'border-t-2 border-t-red-500';
      case STATUS_TYPES.DONE:
        return 'border-t-2 border-t-green-500';
      default:
        return 'border-t-2 border-t-gray-300';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case STATUS_TYPES.TODO:
        return 'To Do';
      case STATUS_TYPES.IN_PROGRESS:
        return 'In Progress';
      case STATUS_TYPES.OVERDUE:
        return 'Overdue';
      case STATUS_TYPES.DONE:
        return 'Done';
      default:
        return status;
    }
  };

  // Obtenir la liste des projets uniques depuis les tâches
  const projectNames = useMemo(() => {
    const uniqueProjects = [...new Set(tasks.map(task => task.projet?.titre).filter(Boolean))];
    return uniqueProjects.sort();
  }, [tasks]);

  // Filtrer les tâches
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Filtre par statut (par défaut exclure "done")
      if (statusFilter === 'all') {
        if (task.statut === STATUS_TYPES.DONE) return false;
      } else if (statusFilter !== task.statut) {
        return false;
      }

      // Filtre par projet
      if (projectFilter !== 'all' && task.projet?.titre !== projectFilter) {
        return false;
      }

      // Filtre par recherche (nom de la tâche ou projet)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesNom = task.nom?.toLowerCase().includes(query);
        const matchesProject = task.projet?.titre?.toLowerCase().includes(query);
        
        if (!matchesNom && !matchesProject) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, statusFilter, searchQuery, projectFilter]);

  // Organiser les tâches filtrées par statut
  const tasksByStatus = useMemo(() => {
    return {
      [STATUS_TYPES.TODO]: filteredTasks.filter((t) => t.statut === STATUS_TYPES.TODO),
      [STATUS_TYPES.IN_PROGRESS]: filteredTasks.filter((t) => t.statut === STATUS_TYPES.IN_PROGRESS),
      [STATUS_TYPES.OVERDUE]: filteredTasks.filter((t) => t.statut === STATUS_TYPES.OVERDUE),
      [STATUS_TYPES.DONE]: filteredTasks.filter((t) => t.statut === STATUS_TYPES.DONE),
    };
  }, [filteredTasks]);

  const getStatusIcon = (status) => {
    switch (status) {
      case STATUS_TYPES.IN_PROGRESS:
        return <Clock className="h-4 w-4 text-orange-500" />;
      case STATUS_TYPES.OVERDUE:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case STATUS_TYPES.DONE:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Composant TaskCard pour le Kanban
  const TaskCard = ({ task }) => {
    return (
      <div className="group">
        <Card
          className={`mb-3 hover:shadow-md transition-shadow cursor-pointer ${getStatusColor(
            task.statut
          )}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <div className="mb-3">
                  <span className="text-xs text-gray-500">Nom de la tâche:</span>
                  <p className="text-sm text-gray-900 line-clamp-2 font-semibold">{task.nom}</p>
                </div>
                {task.projet && (
                  <div className="mb-2">
                    <span className="text-xs text-gray-500">Projet:</span>
                    <p className="text-xs text-gray-600">{task.projet.titre}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingTask({ ...task });
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5 text-gray-500" />
                </button>
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTask(task.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </button>
              </div>
            </div>


            <div className="flex items-center gap-2">
              <Badge
                className={`${PRIORITY_COLORS[task.priorite]} border font-medium text-xs`}
              >
                {task.priorite.charAt(0).toUpperCase() + task.priorite.slice(1)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Composant Column pour le Kanban
  const Column = ({ status, tasks: columnTasks }) => {
    return (
      <div className="min-w-[300px] w-80 flex-shrink-0 flex flex-col bg-gray-50 rounded-lg p-4 h-full">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{getStatusLabel(status)}</h3>
            <Badge
              variant="secondary"
              className={`text-xs ${
                status === STATUS_TYPES.IN_PROGRESS
                  ? 'bg-orange-100 text-orange-700'
                  : status === STATUS_TYPES.OVERDUE
                  ? 'bg-red-100 text-red-700'
                  : status === STATUS_TYPES.DONE
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {columnTasks.length}
            </Badge>
          </div>
          {getStatusIcon(status)}
        </div>

        <Button
          variant="ghost"
          className="mb-4 text-teal-600 hover:text-teal-700 hover:bg-teal-50 flex-shrink-0 justify-start"
          onClick={() => {
            setNewTask({ ...newTask, statut: status });
            setIsNewTaskOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter Tâche
        </Button>

        <div className="flex-1 overflow-y-auto pr-2 min-h-0">
          <div className="space-y-0">
            {columnTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {columnTasks.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-xs">
                Aucune tâche
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen container bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Checklist</h1>
            <p className="text-sm text-gray-600">
              Keep track of all your tasks for this event
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white"
              onClick={() => setIsNewTaskOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle tâche
            </Button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={
              viewMode === 'list'
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-white'
            }
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === 'board' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('board')}
            className={
              viewMode === 'board'
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-white'
            }
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Board
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className={
              viewMode === 'calendar'
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-white'
            }
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8" >
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">To Do</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.todo}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">En cours</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.in_progress}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">En retard</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.overdue}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Terminées</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.done}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom de tâche ou projet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filtre par statut */}
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous (sauf terminées)</SelectItem>
                  <SelectItem value={STATUS_TYPES.TODO}>To Do</SelectItem>
                  <SelectItem value={STATUS_TYPES.IN_PROGRESS}>In Progress</SelectItem>
                  <SelectItem value={STATUS_TYPES.OVERDUE}>Overdue</SelectItem>
                  <SelectItem value={STATUS_TYPES.DONE}>Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par projet */}
            <div className="w-full sm:w-48">
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par projet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les projets</SelectItem>
                  {projectNames.map((projectName) => (
                    <SelectItem key={projectName} value={projectName}>
                      {projectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Badges des filtres actifs */}
          {(statusFilter !== 'all' || searchQuery || projectFilter !== 'all') && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtres actifs:
              </span>
              {statusFilter !== 'all' && (
                <Badge
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setStatusFilter('all')}
                >
                  {getStatusLabel(statusFilter)}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              {projectFilter !== 'all' && (
                <Badge
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setProjectFilter('all')}
                >
                  {projectFilter}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              {searchQuery && (
                <Badge
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setSearchQuery('')}
                >
                  Recherche: {searchQuery}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setSearchQuery('');
                  setProjectFilter('all');
                }}
                className="h-6 text-xs"
              >
                Réinitialiser
              </Button>
            </div>
          )}
        </div>

        {viewMode === 'board' && (
          <div 
            className="border-2 container border-black rounded-lg"
          >
            <div 
              className="flex bg-white w-full"
            >
              <div 
                className="flex flex-nowrap gap-4 h-full p-4 overflow-x-auto w-full" 
                style={{ 
                  minWidth: 'max-content', 
                  width: 'max-content',
                  boxSizing: 'border-box'
                }}
              >
                <Column status={STATUS_TYPES.TODO} tasks={tasksByStatus[STATUS_TYPES.TODO]} />
                <Column
                  status={STATUS_TYPES.IN_PROGRESS}
                  tasks={tasksByStatus[STATUS_TYPES.IN_PROGRESS]}
                />
                <Column
                  status={STATUS_TYPES.OVERDUE}
                  tasks={tasksByStatus[STATUS_TYPES.OVERDUE]}
                />
                <Column status={STATUS_TYPES.DONE} tasks={tasksByStatus[STATUS_TYPES.DONE]} />
              </div>
            </div>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matricule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[18rem]">
                      Nom de la tâche
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Projet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date début
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date fin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priorité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                        Aucune tâche trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {task.etudiant?.matricule || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 max-w-[18rem] truncate">
                            {task.nom || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {task.projet?.titre || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {task.date_debut ? (
                              <>
                                <CalendarIcon className="h-4 w-4 text-gray-400" />
                                <span>{formatDate(task.date_debut)}</span>
                              </>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {task.date_fin ? (
                              <>
                                <CalendarIcon className="h-4 w-4 text-gray-400" />
                                <span>{formatDate(task.date_fin)}</span>
                              </>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={`${PRIORITY_COLORS[task.priorite]} border font-medium text-xs`}
                          >
                            {task.priorite.charAt(0).toUpperCase() + task.priorite.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center">
                              <Badge
                                variant="outline"
                                className={
                                  task.statut === STATUS_TYPES.IN_PROGRESS
                                    ? 'border-orange-300 text-orange-700 bg-orange-50 cursor-pointer hover:bg-orange-100'
                                    : task.statut === STATUS_TYPES.OVERDUE
                                    ? 'border-red-300 text-red-700 bg-red-50 cursor-pointer hover:bg-red-100'
                                    : task.statut === STATUS_TYPES.DONE
                                    ? 'border-green-300 text-green-700 bg-green-50 cursor-pointer hover:bg-green-100'
                                    : 'border-gray-300 text-gray-700 bg-gray-50 cursor-pointer hover:bg-gray-100'
                                }
                              >
                                {getStatusLabel(task.statut)}
                                <ChevronDown className="h-3 w-3 ml-1" />
                              </Badge>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="z-[100]">
                              <DropdownMenuItem onClick={() => handleStatusChange(task.id, STATUS_TYPES.TODO)}>
                                To Do
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(task.id, STATUS_TYPES.IN_PROGRESS)}>
                                In Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(task.id, STATUS_TYPES.OVERDUE)}>
                                Overdue
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(task.id, STATUS_TYPES.DONE)}>
                                Done
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingTask({ ...task })}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewMode === 'calendar' && (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p>Calendar view coming soon...</p>
          </div>
        )}
      </div>

      {/* New Task Dialog */}
      <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle Tâche</DialogTitle>
            <DialogDescription>
              Créer une nouvelle tâche pour suivre votre progression
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nom">Nom de la tâche *</Label>
              <Input
                id="nom"
                value={newTask.nom}
                onChange={(e) => setNewTask({ ...newTask, nom: e.target.value })}
                placeholder="Entrez le nom de la tâche"
                required
              />
            </div>
            <div>
              <Label htmlFor="priorite">Priorité *</Label>
              <Select
                value={newTask.priorite}
                onValueChange={(value) => setNewTask({ ...newTask, priorite: value })}
              >
                <SelectTrigger id="priorite">
                  <SelectValue placeholder="Sélectionnez une priorité" />
                </SelectTrigger>
                <SelectContent position="popper" className="!z-[100]">
                  <SelectItem value={PRIORITIES.HIGH}>High</SelectItem>
                  <SelectItem value={PRIORITIES.MID}>Mid</SelectItem>
                  <SelectItem value={PRIORITIES.LOW}>Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date_debut">Date début</Label>
                <Input
                  id="date_debut"
                  type="date"
                  value={newTask.date_debut}
                  onChange={(e) => setNewTask({ ...newTask, date_debut: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="date_fin">Date fin</Label>
                <Input
                  id="date_fin"
                  type="date"
                  value={newTask.date_fin}
                  onChange={(e) => setNewTask({ ...newTask, date_fin: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="projet_id">Projet *</Label>
              <Select
                value={newTask.projet_id}
                onValueChange={(value) => setNewTask({ ...newTask, projet_id: value })}
              >
                <SelectTrigger id="projet_id">
                  <SelectValue placeholder="Sélectionnez un projet" />
                </SelectTrigger>
                <SelectContent position="popper" className="!z-[100]">
                  {projects.length > 0 ? (
                    projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.titre}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Aucun projet disponible
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTaskOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddTask} className="bg-teal-600 hover:bg-teal-700">
              Créer la Tâche
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        {editingTask && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier la Tâche</DialogTitle>
              <DialogDescription>
                Mettre à jour les détails de la tâche
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-nom">Nom de la tâche *</Label>
                <Input
                  id="edit-nom"
                  value={editingTask.nom || ''}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, nom: e.target.value })
                  }
                  placeholder="Entrez le nom de la tâche"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-priorite">Priorité *</Label>
                <Select
                  value={editingTask.priorite}
                  onValueChange={(value) =>
                    setEditingTask({ ...editingTask, priorite: value })
                  }
                >
                  <SelectTrigger id="edit-priorite">
                    <SelectValue placeholder="Sélectionnez une priorité" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="!z-[100]">
                    <SelectItem value={PRIORITIES.HIGH}>High</SelectItem>
                    <SelectItem value={PRIORITIES.MID}>Mid</SelectItem>
                    <SelectItem value={PRIORITIES.LOW}>Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-date_debut">Date début</Label>
                  <Input
                    id="edit-date_debut"
                    type="date"
                    value={editingTask.date_debut || ''}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, date_debut: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-date_fin">Date fin</Label>
                  <Input
                    id="edit-date_fin"
                    type="date"
                    value={editingTask.date_fin || ''}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, date_fin: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-projet_id">Projet *</Label>
                <Select
                  value={editingTask.projet_id?.toString() || ''}
                  onValueChange={(value) =>
                    setEditingTask({ ...editingTask, projet_id: parseInt(value) })
                  }
                >
                  <SelectTrigger id="edit-projet_id">
                    <SelectValue placeholder="Sélectionnez un projet" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="!z-[100]">
                    {projects.length > 0 ? (
                      projects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.titre}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        Aucun projet disponible
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTask(null)}>
                Annuler
              </Button>
              <Button onClick={handleEditTask} className="bg-teal-600 hover:bg-teal-700">
                Enregistrer les Modifications
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default StudentTasks;

