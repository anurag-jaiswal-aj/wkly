import { Task } from '@/types';

export type RealtimePayload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
};

export interface RealtimeResult {
  tasks: Task[];
  requireTagsForIds: string[];
}

export function applyRealtimeEvent(
  currentTasks: Task[],
  payload: RealtimePayload,
  searchQuery: string | undefined,
  startDate: string,
  endDate: string
): RealtimeResult {
  const { eventType, new: newRow, old: oldRow } = payload;
  const requireTagsForIds: string[] = [];

  if (eventType === 'DELETE') {
    return {
      tasks: currentTasks.filter((t) => t.id !== oldRow.id),
      requireTagsForIds
    };
  }

  if (eventType === 'UPDATE') {
    const updatedTask = newRow as unknown as Task;
    const exists = currentTasks.some((t) => t.id === updatedTask.id);

    if (searchQuery) {
      const safeQuery = searchQuery.toLowerCase();
      const matches =
        updatedTask.title.toLowerCase().includes(safeQuery) ||
        (updatedTask.description && updatedTask.description.toLowerCase().includes(safeQuery));

      if (matches) {
        if (exists) {
          return {
            tasks: currentTasks.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t)),
            requireTagsForIds
          };
        } else {
          requireTagsForIds.push(updatedTask.id);
          return {
            tasks: [...currentTasks, updatedTask],
            requireTagsForIds
          };
        }
      } else {
        if (exists) {
          return {
            tasks: currentTasks.filter((t) => t.id !== updatedTask.id),
            requireTagsForIds
          };
        }
      }
      return { tasks: currentTasks, requireTagsForIds };
    }

    const isWithinWeek = updatedTask.date >= startDate && updatedTask.date <= endDate;

    if (exists && isWithinWeek) {
      return {
        tasks: currentTasks.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t)),
        requireTagsForIds
      };
    } else if (exists && !isWithinWeek) {
      return {
        tasks: currentTasks.filter((t) => t.id !== updatedTask.id),
        requireTagsForIds
      };
    } else if (!exists && isWithinWeek) {
      requireTagsForIds.push(updatedTask.id);
      return {
        tasks: [...currentTasks, updatedTask],
        requireTagsForIds
      };
    }
    return { tasks: currentTasks, requireTagsForIds };
  }

  if (eventType === 'INSERT') {
    const newTask = newRow as unknown as Task;
    const exists = currentTasks.some((t) => t.id === newTask.id);

    if (exists) {
      return { tasks: currentTasks, requireTagsForIds };
    }

    if (searchQuery) {
      const safeQuery = searchQuery.toLowerCase();
      const matches =
        newTask.title.toLowerCase().includes(safeQuery) ||
        (newTask.description && newTask.description.toLowerCase().includes(safeQuery));
      if (matches) {
        requireTagsForIds.push(newTask.id);
        return {
          tasks: [...currentTasks, newTask],
          requireTagsForIds
        };
      }
      return { tasks: currentTasks, requireTagsForIds };
    }

    const isWithinWeek = newTask.date >= startDate && newTask.date <= endDate;
    if (isWithinWeek) {
      requireTagsForIds.push(newTask.id);
      return {
        tasks: [...currentTasks, newTask],
        requireTagsForIds
      };
    }
  }

  return { tasks: currentTasks, requireTagsForIds };
}
