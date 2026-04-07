// ─── Query key factory ────────────────────────────────────────────────────────
// Central registry so keys are never mistyped and related queries can be
// invalidated by prefix (e.g. invalidate all ['projects', id, *]).

export const queryKeys = {
  projects:        ()        => ['projects']                  as const,
  project:         (id: string) => ['projects', id]           as const,
  projectTasks:    (id: string) => ['projects', id, 'tasks']  as const,
  divisions:       ()        => ['divisions']                 as const,
  users:           ()        => ['users']                     as const,
  notifications:   (uid: string) => ['notifications', uid]   as const,
} as const;
