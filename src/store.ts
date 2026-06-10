import { create } from 'zustand';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Project, Task, TaskStatus, Department, FlowLog } from './types';

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function migrateProject(p: Project): Project {
  return { ...p, departments: p.departments ?? [] };
}

function migrateTask(t: Task): Task {
  return {
    ...t,
    currentDepartmentId: t.currentDepartmentId ?? null,
    flowLogs: t.flowLogs ?? [],
  };
}

interface AppStore {
  projects: Project[];
  tasks: Task[];
  currentProjectId: string | null;
  sidebarOpen: boolean;

  addProject: (name: string, description: string) => void;
  deleteProject: (id: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  setCurrentProject: (id: string | null) => void;
  toggleSidebar: () => void;

  addDepartment: (projectId: string, name: string) => void;
  removeDepartment: (projectId: string, departmentId: string) => void;
  updateDepartment: (projectId: string, departmentId: string, name: string) => void;

  addTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'flowLogs'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus) => void;

  setTaskDepartment: (taskId: string, departmentId: string, departmentName: string) => void;
  addFlowNote: (taskId: string, departmentId: string, departmentName: string, note: string) => void;

  getProjectTasks: (projectId: string) => Task[];
  getProjectDepartments: (projectId: string) => Department[];
  getTaskCurrentDepartment: (task: Task) => Department | null;
  getTaskFlowLogs: (taskId: string) => FlowLog[];
}

export const useStore = create<AppStore>()((set, get) => ({
  projects: [],
  tasks: [],
  currentProjectId: null,
  sidebarOpen: true,

  addProject: (name, description) => {
    const project: Project = {
      id: uid(),
      name,
      description,
      status: 'active',
      departments: [],
      createdAt: Date.now(),
    };
    set((s) => ({
      projects: [...s.projects, project],
      currentProjectId: project.id,
    }));
  },

  deleteProject: (id) => {
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      tasks: s.tasks.filter((t) => t.projectId !== id),
      currentProjectId: s.currentProjectId === id ? null : s.currentProjectId,
    }));
  },

  updateProject: (id, updates) => {
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  },

  setCurrentProject: (id) =>
    set({ currentProjectId: id, sidebarOpen: window.innerWidth < 768 ? false : true }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  addDepartment: (projectId, name) => {
    const dept: Department = { id: uid(), name };
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? { ...migrateProject(p), departments: [...p.departments, dept] }
          : p
      ),
    }));
  },

  removeDepartment: (projectId, departmentId) => {
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? { ...migrateProject(p), departments: p.departments.filter((d) => d.id !== departmentId) }
          : p
      ),
    }));
  },

  updateDepartment: (projectId, departmentId, name) => {
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...migrateProject(p),
              departments: p.departments.map((d) =>
                d.id === departmentId ? { ...d, name } : d
              ),
            }
          : p
      ),
    }));
  },

  addTask: (data) => {
    const task: Task = {
      ...data,
      id: uid(),
      currentDepartmentId: data.currentDepartmentId ?? null,
      flowLogs: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({ tasks: [...s.tasks, task] }));
  },

  updateTask: (id, updates) => {
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...migrateTask(t), ...updates, updatedAt: Date.now() } : t
      ),
    }));
  },

  deleteTask: (id) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },

  moveTask: (id, status) => {
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...migrateTask(t), status, updatedAt: Date.now() } : t
      ),
    }));
  },

  setTaskDepartment: (taskId, departmentId, departmentName) => {
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const safe = migrateTask(t);
        const updatedLogs = safe.flowLogs.map((log) =>
          log.completedAt === null ? { ...log, completedAt: Date.now() } : log
        );
        const newLog: FlowLog = {
          id: uid(),
          departmentId,
          departmentName,
          note: '',
          enteredAt: Date.now(),
          completedAt: null,
        };
        return {
          ...safe,
          currentDepartmentId: departmentId,
          flowLogs: [...updatedLogs, newLog],
          updatedAt: Date.now(),
        };
      }),
    }));
  },

  addFlowNote: (taskId, departmentId, departmentName, note) => {
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const safe = migrateTask(t);
        const log: FlowLog = {
          id: uid(),
          departmentId,
          departmentName,
          note,
          enteredAt: Date.now(),
          completedAt: Date.now(),
        };
        return {
          ...safe,
          flowLogs: [...safe.flowLogs, log],
          updatedAt: Date.now(),
        };
      }),
    }));
  },

  getProjectTasks: (projectId) => {
    return get().tasks.map(migrateTask).filter((t) => t.projectId === projectId);
  },

  getProjectDepartments: (projectId) => {
    const project = get().projects.find((p) => p.id === projectId);
    return project ? (project.departments ?? []) : [];
  },

  getTaskCurrentDepartment: (task) => {
    if (!task.currentDepartmentId) return null;
    const project = get().projects.find((p) => p.id === task.projectId);
    return project?.departments?.find((d) => d.id === task.currentDepartmentId) ?? null;
  },

  getTaskFlowLogs: (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    return task?.flowLogs ?? [];
  },
}));

// ---- Firestore sync ----

let currentUid: string | null = null;
let syncTimer: ReturnType<typeof setTimeout> | null = null;

async function doSync() {
  if (!currentUid) return;
  const state = useStore.getState();
  await setDoc(doc(db, 'users', currentUid, 'data'), {
    projects: state.projects,
    tasks: state.tasks,
  });
}

useStore.subscribe(() => {
  if (!currentUid) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(doSync, 2000);
});

export async function loadUserData(uid: string) {
  currentUid = uid;
  const snap = await getDoc(doc(db, 'users', uid, 'data'));
  if (snap.exists()) {
    const data = snap.data() as { projects: Project[]; tasks: Task[] };
    useStore.setState({ projects: data.projects ?? [], tasks: data.tasks ?? [] });
    return;
  }

  // Migrate old localStorage data if it exists
  try {
    const raw = localStorage.getItem('project-flow-storage');
    if (raw) {
      const parsed = JSON.parse(raw);
      const state = parsed?.state as { projects?: Project[]; tasks?: Task[] } | undefined;
      const migratedProjects = (state?.projects ?? []).map(migrateProject);
      const migratedTasks = (state?.tasks ?? []).map(migrateTask);
      useStore.setState({ projects: migratedProjects, tasks: migratedTasks });
      localStorage.removeItem('project-flow-storage');
      return;
    }
  } catch { /* ignore corrupt localStorage */ }

  useStore.setState({ projects: [], tasks: [] });
}

export function clearUserData() {
  currentUid = null;
  if (syncTimer) clearTimeout(syncTimer);
  useStore.setState({ projects: [], tasks: [], currentProjectId: null });
}
