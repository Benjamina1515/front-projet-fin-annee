import { useState, useMemo, useEffect } from 'react';
import {
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  X,
  ChevronDown,
} from 'lucide-react';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';
import { toast } from 'react-toastify';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';

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

const ProfessorStudentTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // board, list

  // États pour les filtres
  const [statusFilter, setStatusFilter] = useState('not_done'); // 'not_done', 'all', 'todo', 'in_progress', 'overdue', 'done'
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');

  // Charger les tâches et projets au montage
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [tasksData, projectsData] = await Promise.all([
          taskService.getProfessorStudentTasks(),
          projectService.getAllProjects(),
        ]);

        setTasks(tasksData);
        setProjects(projectsData || []);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des tâches des étudiants');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
      case 'not_done':
        return 'Non terminées';
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

  // Liste des projets du professeur (depuis l'API projets)
  const projectNames = useMemo(() => {
    const names = (projects || []).map(p => p.titre).filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [projects]);

  // Groupes disponibles selon le projet sélectionné (pas seulement ceux ayant des tâches)
  const groups = useMemo(() => {
    if (projectFilter === 'all') return [];
    const selected = (projects || []).find(p => p.titre === projectFilter);
    if (!selected || !selected.groupes) return [];
    const nums = selected.groupes.map(g => g.numero_groupe).filter(g => g != null);
    return Array.from(new Set(nums)).sort((a, b) => a - b);
  }, [projects, projectFilter]);

  // Filtrer les tâches (afficher uniquement les groupes/tâches réellement existants)
  const filteredTasks = useMemo(() => {
    const base = tasks.filter((task) => {
      // Filtre par statut
      if (statusFilter === 'not_done') {
        if (task.statut === STATUS_TYPES.DONE) {
          return false;
        }
      } else if (statusFilter !== 'all' && statusFilter !== task.statut) {
        return false;
      }

      // Filtre par projet
      if (projectFilter !== 'all' && task.projet?.titre !== projectFilter) {
        return false;
      }

      // Filtre par groupe
      if (groupFilter !== 'all') {
        const taskGroupNumber = task.groupe?.numero_groupe?.toString();
        if (taskGroupNumber !== groupFilter) {
          return false;
        }
      }

      // Filtre par recherche (nom de la tâche, projet, étudiant, matricule)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesNom = task.nom?.toLowerCase().includes(query);
        const matchesProject = task.projet?.titre?.toLowerCase().includes(query);
        const matchesStudent = task.etudiant?.nom?.toLowerCase().includes(query);
        const matchesMatricule = task.etudiant?.matricule?.toLowerCase().includes(query);

        if (!matchesNom && !matchesProject && !matchesStudent && !matchesMatricule) {
          return false;
        }
      }

      return true;
    });

    return base;
  }, [tasks, statusFilter, searchQuery, projectFilter, groupFilter]);

  // Organiser les tâches filtrées par statut
  const tasksByStatus = useMemo(() => {
    return {
      [STATUS_TYPES.TODO]: filteredTasks.filter((t) => t.statut === STATUS_TYPES.TODO),
      [STATUS_TYPES.IN_PROGRESS]: filteredTasks.filter((t) => t.statut === STATUS_TYPES.IN_PROGRESS),
      [STATUS_TYPES.OVERDUE]: filteredTasks.filter((t) => t.statut === STATUS_TYPES.OVERDUE),
      [STATUS_TYPES.DONE]: filteredTasks.filter((t) => t.statut === STATUS_TYPES.DONE),
    };
  }, [filteredTasks]);

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
              <div key={i} className="grid grid-cols-10 gap-4 px-6 py-4 items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-72 col-span-1" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Composant TaskCard pour le Kanban
  const TaskCard = ({ task }) => {
    if (!task) {
      return null;
    }

    return (
      <Card
        className={`group mb-3 transition-shadow ${getStatusColor(task.statut)} hover:shadow-md`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 w-full">
              <div className="mb-3">
                <p className="text-sm text-gray-900 line-clamp-2 font-semibold">{task.nom}</p>
              </div>
              <div className="mb-2 space-y-1">
                {task.etudiant && (
                  <div className="flex gap-1">
                    <span className="text-xs text-gray-500">Étudiant:</span>
                    <p className="text-xs text-gray-600 font-medium">
                      {task.etudiant.nom || task.etudiant.matricule} ({task.etudiant.matricule})
                    </p>
                  </div>
                )}
                {task.projet && (
                  <div className="flex gap-1">
                    <span className="text-xs text-gray-500">Projet:</span>
                    <p className="text-xs text-gray-600"> {task.projet.titre}</p>
                  </div>
                )}
                {task.groupe && (
                  <div className="flex gap-1">
                    <span className="text-xs text-gray-500">Groupe:</span>
                    <p className="text-xs text-gray-600"> {task.groupe.numero_groupe}</p>
                  </div>
                )}
                {task.etudiant?.niveau && (
                  <div className="flex gap-1">
                    <span className="text-xs text-gray-500">Niveau:</span>
                    <p className="text-xs text-gray-600"> {task.etudiant.niveau}</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Badge
                className={`${PRIORITY_COLORS[task.priorite]} border font-medium text-xs`}
              >
                {getPriorityLabel(task.priorite)}
              </Badge>
            </div>
          </div>

          <div className="mt-3 space-y-1 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
              <span>
                Début:
                <span className="ml-1 text-gray-700">
                  {task.date_debut ? formatDate(task.date_debut) : '-'}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
              <span>
                Fin:
                <span className="ml-1 text-gray-700">
                  {task.date_fin ? formatDate(task.date_fin) : '-'}
                </span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Composant Column pour le Kanban
  const Column = ({ status, tasks: columnTasks }) => {
    return (
      <div className="flex-1 min-w-[280px] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-900">{getStatusLabel(status)}</h2>
            <Badge
              variant="secondary"
              className={`${status === STATUS_TYPES.IN_PROGRESS
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
        </div>

        <ScrollArea className="flex-1 pr-2 min-h-[200px]">
          <div className="space-y-0 min-h-[220px] bg-gray-100 rounded-md px-2 py-1">
            {columnTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {columnTasks.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm border border-dashed border-gray-200 rounded-md">
                Aucune tâche
              </div>
            )}
          </div>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Supervision des Tâches</h1>
            <p className="text-sm text-gray-600">
              Suivez les tâches de vos étudiants
            </p>
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
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        {/* Filtres */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col gap-4">
            {/* Première ligne : Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom de tâche, projet, étudiant ou matricule..."
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

            {/* Deuxième ligne : Filtres */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtre par statut */}
              <div className="w-full">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_done">Non terminées</SelectItem>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value={STATUS_TYPES.TODO}>À faire</SelectItem>
                    <SelectItem value={STATUS_TYPES.IN_PROGRESS}>En cours</SelectItem>
                    <SelectItem value={STATUS_TYPES.OVERDUE}>En retard</SelectItem>
                    <SelectItem value={STATUS_TYPES.DONE}>Terminée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre par projet */}
              <div className="w-full">
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

              {/* Filtre par groupe */}
              <div className="w-full">
                <Select value={groupFilter} onValueChange={setGroupFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer par groupe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les groupes</SelectItem>
                    {groups.map((groupNumber) => (
                      <SelectItem key={groupNumber} value={groupNumber.toString()}>
                        Groupe {groupNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bouton réinitialiser */}
              <div className="w-full">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter('not_done');
                    setSearchQuery('');
                    setProjectFilter('all');
                    setGroupFilter('all');
                  }}
                  className="w-full"
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </div>

          {/* Badges des filtres actifs */}
          {(statusFilter !== 'all' || searchQuery || projectFilter !== 'all' || groupFilter !== 'all') && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtres actifs:
              </span>
              {statusFilter !== 'all' && statusFilter !== 'not_done' && (
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
              {groupFilter !== 'all' && (
                <Badge
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setGroupFilter('all')}
                >
                  Groupe {groupFilter}
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
            </div>
          )}
        </div>

        {viewMode === 'board' && (
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Étudiant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[18rem]">
                      Nom de la tâche
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Projet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Niveau
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Groupe
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-12 text-center text-gray-500">
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {task.etudiant?.nom || '-'}
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
                          <div className="text-sm text-gray-900">
                            {task.etudiant?.niveau || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {task.groupe?.numero_groupe ? `Groupe ${task.groupe.numero_groupe}` : '-'}
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
                          <Badge
                            variant="outline"
                            className={
                              task.statut === STATUS_TYPES.IN_PROGRESS
                                ? 'border-orange-300 text-orange-700 bg-orange-50'
                                : task.statut === STATUS_TYPES.OVERDUE
                                  ? 'border-red-300 text-red-700 bg-red-50'
                                  : task.statut === STATUS_TYPES.DONE
                                    ? 'border-green-300 text-green-700 bg-green-50'
                                    : 'border-gray-300 text-gray-700 bg-gray-50'
                            }
                          >
                            {getStatusLabel(task.statut)}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessorStudentTasks;

