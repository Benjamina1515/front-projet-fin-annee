import { useState } from 'react';
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
} from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select-new';

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

// Données mockées initiales
const initialTasks = [
  {
    id: '1',
    title: 'Build a wedding website',
    description: 'Home to your registry, online RSVP and wedding details. Free and foolproof you\'ll have it live in no time.',
    dueDate: '2025-08-10',
    priority: PRIORITIES.HIGH,
    status: STATUS_TYPES.TODO,
  },
  {
    id: '2',
    title: 'Hire Photographer',
    description: 'Find and book a professional photographer for the event.',
    dueDate: '2025-08-15',
    priority: PRIORITIES.MID,
    status: STATUS_TYPES.TODO,
  },
  {
    id: '3',
    title: 'Confirm Decor & Setup',
    description: 'Finalize decoration plans and setup arrangements.',
    dueDate: '2025-08-20',
    priority: PRIORITIES.HIGH,
    status: STATUS_TYPES.IN_PROGRESS,
  },
  {
    id: '4',
    title: 'Order Catering',
    description: 'Place order for food and beverages.',
    dueDate: '2025-07-25',
    priority: PRIORITIES.MID,
    status: STATUS_TYPES.OVERDUE,
  },
  {
    id: '5',
    title: 'Send Invitations',
    description: 'Design and send wedding invitations to all guests.',
    dueDate: '2025-08-05',
    priority: PRIORITIES.LOW,
    status: STATUS_TYPES.DONE,
  },
];

const StudentTasks = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [viewMode, setViewMode] = useState('list'); // board, list, calendar
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: PRIORITIES.MID,
    status: STATUS_TYPES.TODO,
  });


  const handleAddTask = () => {
    if (!newTask.title.trim()) return;

    const task = {
      id: Date.now().toString(),
      ...newTask,
      dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
    };

    setTasks((prev) => [...prev, task]);
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      priority: PRIORITIES.MID,
      status: STATUS_TYPES.TODO,
    });
    setIsNewTaskOpen(false);
  };

  const handleEditTask = () => {
    if (!editingTask || !editingTask.title.trim()) return;

    setTasks((prev) =>
      prev.map((task) => (task.id === editingTask.id ? editingTask : task))
    );
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
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

  // Organiser les tâches par statut
  const tasksByStatus = {
    [STATUS_TYPES.TODO]: tasks.filter((t) => t.status === STATUS_TYPES.TODO),
    [STATUS_TYPES.IN_PROGRESS]: tasks.filter((t) => t.status === STATUS_TYPES.IN_PROGRESS),
    [STATUS_TYPES.OVERDUE]: tasks.filter((t) => t.status === STATUS_TYPES.OVERDUE),
    [STATUS_TYPES.DONE]: tasks.filter((t) => t.status === STATUS_TYPES.DONE),
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

  // Composant TaskCard pour le Kanban
  const TaskCard = ({ task }) => {
    return (
      <div className="group">
        <Card
          className={`mb-3 hover:shadow-md transition-shadow cursor-pointer ${getStatusColor(
            task.status
          )}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-gray-900 mb-1">{task.title}</h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {task.description}
                </p>
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

            <div className="flex items-center gap-2 mb-3">
              <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">
                {formatDate(task.dueDate)}
              </span>
            </div>

            <div className="flex items-center">
              <Badge
                className={`${PRIORITY_COLORS[task.priority]} border font-medium text-xs`}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
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
            setNewTask({ ...newTask, status });
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
              New task
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
      <div className="py-8" >
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
                      Titre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priorité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'échéance
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        Aucune tâche trouvée
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {task.title}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-md truncate">
                            {task.description || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={
                              task.status === STATUS_TYPES.IN_PROGRESS
                                ? 'border-orange-300 text-orange-700 bg-orange-50'
                                : task.status === STATUS_TYPES.OVERDUE
                                ? 'border-red-300 text-red-700 bg-red-50'
                                : task.status === STATUS_TYPES.DONE
                                ? 'border-green-300 text-green-700 bg-green-50'
                                : 'border-gray-300 text-gray-700 bg-gray-50'
                            }
                          >
                            {getStatusLabel(task.status)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={`${PRIORITY_COLORS[task.priority]} border font-medium text-xs`}
                          >
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(task.dueDate)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingTask({ ...task })}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="h-4 w-4 text-gray-600 hover:text-gray-900" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTask(task.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                            </Button>
                          </div>
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
            <DialogTitle>New Task</DialogTitle>
            <DialogDescription>
              Create a new task to track your progress
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PRIORITIES.HIGH}>High</SelectItem>
                    <SelectItem value={PRIORITIES.MID}>Mid</SelectItem>
                    <SelectItem value={PRIORITIES.LOW}>Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask} className="bg-teal-600 hover:bg-teal-700">
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        {editingTask && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>
                Update task details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingTask.description}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, description: e.target.value })
                  }
                  placeholder="Enter task description"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-dueDate">Due Date</Label>
                  <Input
                    id="edit-dueDate"
                    type="date"
                    value={editingTask.dueDate}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, dueDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select
                    value={editingTask.priority}
                    onValueChange={(value) =>
                      setEditingTask({ ...editingTask, priority: value })
                    }
                  >
                    <SelectTrigger id="edit-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PRIORITIES.HIGH}>High</SelectItem>
                      <SelectItem value={PRIORITIES.MID}>Mid</SelectItem>
                      <SelectItem value={PRIORITIES.LOW}>Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingTask.status}
                  onValueChange={(value) =>
                    setEditingTask({ ...editingTask, status: value })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={STATUS_TYPES.TODO}>To Do</SelectItem>
                    <SelectItem value={STATUS_TYPES.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={STATUS_TYPES.OVERDUE}>Overdue</SelectItem>
                    <SelectItem value={STATUS_TYPES.DONE}>Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTask(null)}>
                Cancel
              </Button>
              <Button onClick={handleEditTask} className="bg-teal-600 hover:bg-teal-700">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default StudentTasks;

