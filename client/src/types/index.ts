export type UserRole = 'superadmin' | 'user';

export interface Division {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  divisionId?: string;
  division?: Division;
}

export type ProjectStatus = 'on_track' | 'at_risk' | 'overdue' | 'completed';

export interface Project {
  id: string;
  name: string;
  address: string;
  type: 'Mall' | 'Stand Alone';
  brand: string;
  openingDate: string;
  status: ProjectStatus;
  progress: number;
  isLocked: boolean;
  created: string;
  updated: string;
}

export interface Task {
  id: string;
  projectId: string;
  divisionId: string;
  name: string;
  startDate?: string;
  deadline?: string;
  pic?: string;
  isCompleted: boolean;
  detail?: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
}
