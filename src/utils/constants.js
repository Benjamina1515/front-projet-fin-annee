// Rôles utilisateurs (alignés avec le backend)
export const ROLES = {
  ADMIN: 'admin',
  PROFESSOR: 'prof',
  STUDENT: 'etudiant',
};

// Statuts de projet
export const PROJECT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Statuts de tâche
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  EVALUATED: 'evaluated',
  REJECTED: 'rejected',
};

// Routes selon les rôles
export const ROLE_ROUTES = {
  [ROLES.ADMIN]: '/admin',
  [ROLES.PROFESSOR]: '/professor',
  [ROLES.STUDENT]: '/student',
};

