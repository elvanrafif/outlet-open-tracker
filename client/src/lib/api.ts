// ─── PocketBase API layer ─────────────────────────────────────────────────────
// Pure async functions — no React, no state, no hooks.
// All PocketBase access must flow through here (DIP: hooks depend on this, not pb directly).

import { pb } from '@/lib/pb';
import { DEFAULT_TASKS } from '@/lib/taskTemplates';
import type { Project, Task, Division, User } from '@/types/index';

pb.autoCancellation(false);

// ── Status helpers ────────────────────────────────────────────────────────────

export const calcProjectStatus = (project: Project): Project => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const openingDate = new Date(project.openingDate);
  const diffDays = Math.ceil((openingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let status: Project['status'];
  if (project.progress === 100)  status = 'completed';
  else if (diffDays < 0)         status = 'overdue';
  else if (diffDays < 7)         status = 'at_risk';
  else                           status = 'on_track';

  return { ...project, status };
};

export const calcTaskProgress = (tasks: Task[], openingDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.isCompleted).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const hasOverdue = tasks.some(
    (t) => !t.isCompleted && t.deadline && new Date(t.deadline) < today
  );
  const opening = new Date(openingDate);
  const diffDays = Math.ceil((opening.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  let status: Project['status'];
  if (progress === 100)              status = 'completed';
  else if (hasOverdue || diffDays < 0) status = 'overdue';
  else if (diffDays < 7)             status = 'at_risk';
  else                               status = 'on_track';

  return { progress, status };
};

// ── Projects ──────────────────────────────────────────────────────────────────

export const fetchProjects = async (): Promise<Project[]> => {
  const records = await pb.collection('projects').getFullList<Project>({ sort: '-created' });
  const withStatus = records.map(calcProjectStatus);

  // Persist stale statuses back to DB in the background
  const stale = withStatus.filter((p, i) => p.status !== records[i].status);
  if (stale.length > 0) {
    Promise.all(stale.map((p) => pb.collection('projects').update(p.id, { status: p.status })));
  }

  return withStatus;
};

export type CreateProjectInput = {
  name: string;
  address: string;
  type: 'mall' | 'stand_alone';
  brand: string;
  openingDate: string;
};

export const createProject = async (data: CreateProjectInput): Promise<Project> => {
  const project = await pb.collection('projects').create<Project>({
    ...data, status: 'on_track', progress: 0, isLocked: false,
  });

  const divisions = await pb.collection('divisions').getFullList<Division>();
  const seedTasks = DEFAULT_TASKS.map((tmpl) => {
    const div = divisions.find(
      (d) => d.name.trim().toLowerCase() === tmpl.division.trim().toLowerCase()
    );
    if (!div) return null;
    return pb.collection('tasks').create({
      projectId: project.id, divisionId: div.id, name: tmpl.name, isCompleted: false,
    });
  }).filter(Boolean);

  await Promise.all(seedTasks);
  return project;
};

// ── Project detail ────────────────────────────────────────────────────────────

export const fetchProject = (id: string): Promise<Project> =>
  pb.collection('projects').getOne<Project>(id);

export const fetchProjectTasks = (projectId: string): Promise<Task[]> =>
  pb.collection('tasks').getFullList<Task>({
    filter: `projectId = "${projectId}"`,
    sort: 'created',
    expand: 'lastEditedBy',
  });

export const updateTask = (taskId: string, data: Partial<Task>): Promise<Task> =>
  pb.collection('tasks').update<Task>(taskId, data);

export const updateProjectRecord = (
  id: string,
  data: Partial<Project>
): Promise<Project> =>
  pb.collection('projects').update<Project>(id, data);

// ── Divisions ─────────────────────────────────────────────────────────────────

export const fetchDivisions = (): Promise<Division[]> =>
  pb.collection('divisions').getFullList<Division>({ sort: 'name' });

// ── Users ─────────────────────────────────────────────────────────────────────

export type CreateUserInput = {
  email: string;
  name: string;
  password: string;
  role: string;
  divisionId: string;
};

export const fetchUsers = async (): Promise<User[]> => {
  const records = await pb.collection('users').getFullList({
    expand: 'divisionId',
    sort: '-created',
  });

  return records.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name || r.username,
    role: r.role,
    divisionId: r.divisionId,
    division: r.expand?.divisionId
      ? { id: r.expand.divisionId.id, name: r.expand.divisionId.name }
      : undefined,
  }));
};

export const createUser = (data: CreateUserInput): Promise<void> =>
  pb.collection('users').create({
    ...data,
    emailVisibility: true,
    passwordConfirm: data.password,
  });

export const updateUser = (id: string, data: Record<string, unknown>): Promise<void> =>
  pb.collection('users').update(id, data);

// ── Notifications ─────────────────────────────────────────────────────────────

export type NotificationRaw = {
  id: string;
  taskId: string;
  projectId: string;
  projectName: string;
  taskName: string;
  type: 'deadline' | 'overdue';
  daysLeft?: number;
};

export const fetchNotifications = async (
  role: string,
  divisionId?: string
): Promise<NotificationRaw[]> => {
  let filter = 'isCompleted = false && deadline != ""';
  if (role !== 'superadmin' && divisionId) {
    filter += ` && divisionId = "${divisionId}"`;
  }

  const tasks = await pb.collection('tasks').getFullList<Task>({
    filter,
    expand: 'projectId',
  });

  const now = new Date();
  const result: NotificationRaw[] = [];

  (tasks as any[]).forEach((task) => {
    const deadline = new Date(task.deadline);
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      result.push({
        id: `overdue-${task.id}`,
        taskId: task.id,
        projectId: task.projectId,
        projectName: task.expand?.projectId?.name ?? 'Unknown Project',
        taskName: task.name,
        type: 'overdue',
      });
    } else if (diffDays <= 7) {
      result.push({
        id: `deadline-${task.id}`,
        taskId: task.id,
        projectId: task.projectId,
        projectName: task.expand?.projectId?.name ?? 'Unknown Project',
        taskName: task.name,
        type: 'deadline',
        daysLeft: diffDays,
      });
    }
  });

  return result;
};
