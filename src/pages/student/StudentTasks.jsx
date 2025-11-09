import { useState, useMemo, useEffect, forwardRef } from 'react';
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
  Loader2,
} from 'lucide-react';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

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

const toDateInputValue = (value) => {
  if (!value) return '';

  if (typeof value === 'string') {
    const trimmed = value.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const iso = parsed.toISOString();
  return iso.split('T')[0];
};

const mapTaskForEditing = (task) => ({
  ...task,
  date_debut: toDateInputValue(task.date_debut),
  date_fin: toDateInputValue(task.date_fin),
  projet_id: task.projet_id ?? task.projet?.id ?? '',
});

const StudentTasks = () => {
  const { user: _user } = useAuth();
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
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

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
      setIsCreatingTask(true);
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
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleEditTask = async () => {
    if (!editingTask || !editingTask.nom.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsUpdatingTask(true);
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
    } finally {
      setIsUpdatingTask(false);
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
    const previousTasks = tasks.map((task) => ({ ...task }));
    const previousStats = { ...stats };
    const targetTask = tasks.find((task) => task.id === taskId);

    if (!targetTask || targetTask.statut === newStatus) {
      return;
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              statut: newStatus,
            }
          : task
      )
    );

    try {
      const updatedTask = await taskService.updateStatus(taskId, newStatus);
      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );

      const statsData = await taskService.getStats();
      setStats(statsData);
      toast.success('Statut de la tâche mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setTasks(previousTasks);
      setStats(previousStats);
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
        return 'border-t-2 border-t-blue-900';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case STATUS_TYPES.TODO:
        return 'À faire';
      case STATUS_TYPES.IN_PROGRESS:
        return 'En cours';
      case STATUS_TYPES.OVERDUE:
        return 'En retard';
      case STATUS_TYPES.DONE:
        return 'Terminée';
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case PRIORITIES.HIGH:
        return 'Haute';
      case PRIORITIES.MID:
        return 'Moyenne';
      case PRIORITIES.LOW:
        return 'Basse';
      default:
        return priority;
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
      // Filtre par statut: 'all' inclut désormais tous les statuts
      if (statusFilter !== 'all' && statusFilter !== task.statut) {
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

  const handleDragStart = (event) => {
    const draggedTask = event.active.data.current?.task;
    if (draggedTask) {
      setActiveTask(draggedTask);
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!active) {
      setActiveTask(null);
      return;
    }

    const activeData = active.data.current;
    const overData = over?.data.current;

    setActiveTask(null);

    if (!activeData) {
      return;
    }

    let destinationStatus = activeData.status;

    if (overData?.type === 'task') {
      destinationStatus = overData.status;
    } else if (overData?.type === 'column') {
      destinationStatus = overData.status;
    } else if (
      over &&
      typeof over.id === 'string' &&
      Object.values(STATUS_TYPES).includes(over.id)
    ) {
      destinationStatus = over.id;
    }

    if (destinationStatus && destinationStatus !== activeData.status) {
      handleStatusChange(activeData.taskId, destinationStatus);
    }
  };

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
      <div className="container px-8 py-8">
        {/* Header skeleton */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-9 w-36" />
          </div>
        </div>

        {/* Filters skeleton */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-9 w-48" />
          </div>
        </div>

        {/* List skeleton */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="border-b border-gray-200 p-3">
            <Skeleton className="h-5 w-full" />
          </div>
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-8 gap-4 px-6 py-4 items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-72 col-span-1" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-8 w-8 ml-auto rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Composant TaskCard pour le Kanban
  const TaskCard = forwardRef(
    (
      {
        task,
        style,
        listeners,
        attributes,
        isDragging = false,
        isOverlay = false,
      },
      ref
    ) => {
      if (!task) {
        return null;
      }

      const cardStyle = {
        ...(style ?? {}),
        pointerEvents: isOverlay ? 'none' : style?.pointerEvents,
      };

      return (
        <Card
          ref={ref}
          style={cardStyle}
          className={`group mb-3 transition-shadow ${getStatusColor(task.statut)} ${
            isOverlay ? 'opacity-90 shadow-lg' : 'hover:shadow-md'
          } ${isDragging && !isOverlay ? 'cursor-grabbing shadow-lg' : 'cursor-grab'}`}
          {...(attributes ?? {})}
          {...(listeners ?? {})}
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
                    if (!isOverlay) {
                      setEditingTask(mapTaskForEditing(task));
                    }
                  }}
                  disabled={isOverlay}
                >
                  <Edit2 className="h-3.5 w-3.5 text-gray-500" />
                </button>
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isOverlay) {
                      handleDeleteTask(task.id);
                    }
                  }}
                  disabled={isOverlay}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                className={`${PRIORITY_COLORS[task.priorite]} border font-medium text-xs`}
              >
                {getPriorityLabel(task.priorite)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      );
    }
  );
  TaskCard.displayName = 'TaskCard';

  const SortableTaskCard = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: task.id.toString(),
      data: {
        type: 'task',
        taskId: task.id,
        status: task.statut,
        task,
      },
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <TaskCard
        ref={setNodeRef}
        task={task}
        style={style}
        attributes={attributes}
        listeners={listeners}
        isDragging={isDragging}
      />
    );
  };

  // Composant Column pour le Kanban
  const Column = ({ status, tasks: columnTasks }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: status,
      data: { type: 'column', status },
    });

    return (
      <div className="flex-1 min-w-[280px] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-900">{getStatusLabel(status)}</h2>
            <Badge
              variant="secondary"
              className={`${ 
                status === STATUS_TYPES.IN_PROGRESS
                  ? 'bg-orange-400 text-white'
                  : status === STATUS_TYPES.OVERDUE
                  ? 'bg-red-500 text-white'
                  : status === STATUS_TYPES.DONE
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-900 text-white'
              }`}
            >
              {columnTasks.length}
            </Badge>
          </div>
          {/* {getStatusIcon(status)} */}
        </div>

        <ScrollArea className="flex-1 pr-2 min-h-[200px]">
          <div
            ref={setNodeRef}
            className={`space-y-0 min-h-[220px] rounded-md px-1 pb-1 transition-colors ${
              isOver ? 'bg-teal-50/80 ring-1 ring-teal-200' : ''
            }`}
          >
            <SortableContext
              items={columnTasks.map((task) => task.id.toString())}
              strategy={verticalListSortingStrategy}
            >
              {columnTasks.map((task) => (
                <SortableTaskCard key={task.id} task={task} />
              ))}
            </SortableContext>
            {columnTasks.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm border border-dashed border-gray-200 rounded-md">
                Aucune tâche
              </div>
            )}
          </div>
        <Button
          variant="ghost"
          className="w-full mt-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          onClick={() => {
            setNewTask({ ...newTask, statut: status });
            setIsNewTaskOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tâche
        </Button>
        </ScrollArea>

      </div>
    );
  };

  return (
    <div className="min-h-screen container bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Tâches</h1>
            <p className="text-sm text-gray-600">
              Suivez toutes vos tâches pour cet événement
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
            Liste
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
            Tableau
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
            Calendrier
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8" >
        {/* Statistiques */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
        </div> */}

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
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value={STATUS_TYPES.TODO}>À faire</SelectItem>
                  <SelectItem value={STATUS_TYPES.IN_PROGRESS}>En cours</SelectItem>
                  <SelectItem value={STATUS_TYPES.OVERDUE}>En retard</SelectItem>
                  <SelectItem value={STATUS_TYPES.DONE}>Terminée</SelectItem>
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="border-2 bg-white rounded-lg overflow-x-auto">
              <div className="p-4">
                <div className="flex flex-nowrap gap-4" style={{ minWidth: 'max-content' }}>
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
            <DragOverlay dropAnimation={null}>
              {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
            </DragOverlay>
          </DndContext>
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
                            className={`${PRIORITY_COLORS[task.priorite]} border font-medium text-xs pointer-events-none hover:bg-transparent`}
                          >
                            {getPriorityLabel(task.priorite)}
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
                            <DropdownMenuContent align="end" className="z-9999">
                              <DropdownMenuItem onClick={() => handleStatusChange(task.id, STATUS_TYPES.TODO)}>
                                À faire
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(task.id, STATUS_TYPES.IN_PROGRESS)}>
                                En cours
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(task.id, STATUS_TYPES.OVERDUE)}>
                                En retard
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(task.id, STATUS_TYPES.DONE)}>
                                Terminée
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
                            <DropdownMenuContent align="end" className="z-9999">
                              <DropdownMenuItem onClick={() => setEditingTask(mapTaskForEditing(task))}>
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
            <p>Vue calendrier bientôt disponible...</p>
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
                <SelectContent position="popper" className="z-9999">
                  <SelectItem value={PRIORITIES.HIGH}>Haute</SelectItem>
                  <SelectItem value={PRIORITIES.MID}>Moyenne</SelectItem>
                  <SelectItem value={PRIORITIES.LOW}>Basse</SelectItem>
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
                <SelectContent position="popper" className="z-9999">
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
            <Button onClick={handleAddTask} disabled={isCreatingTask} className="bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed">
              {isCreatingTask ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer la Tâche'
              )}
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
                  <SelectContent position="popper" className="z-9999">
                    <SelectItem value={PRIORITIES.HIGH}>Haute</SelectItem>
                    <SelectItem value={PRIORITIES.MID}>Moyenne</SelectItem>
                    <SelectItem value={PRIORITIES.LOW}>Basse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-date_debut">Date début</Label>
                  <Input
                    id="date_debut"
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
                  <SelectContent position="popper" className="z-9999">
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
              <Button onClick={handleEditTask} disabled={isUpdatingTask} className="bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed">
                {isUpdatingTask ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer les Modifications'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default StudentTasks;

