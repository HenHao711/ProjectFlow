import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { STATUS_LABELS, STATUS_COLORS, STATUS_FLOW } from '../types';
import type { Task, TaskStatus } from '../types';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import FlowLogModal from './FlowLogModal';
import DepartmentModal from './DepartmentModal';
import { Plus, Settings } from 'lucide-react';

export default function KanbanBoard() {
  const tasks = useStore((s) => s.tasks);
  const currentProjectId = useStore((s) => s.currentProjectId);
  const moveTask = useStore((s) => s.moveTask);
  const projects = useStore((s) => s.projects);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [flowTask, setFlowTask] = useState<Task | null>(null);
  const [showDeptModal, setShowDeptModal] = useState(false);

  const projectTasks = useMemo(
    () => tasks.filter((t) => t.projectId === currentProjectId),
    [tasks, currentProjectId]
  );

  const departments = useMemo(
    () => projects.find((p) => p.id === currentProjectId)?.departments ?? [],
    [projects, currentProjectId]
  );

  function getDepartmentName(departmentId: string | null): string | undefined {
    if (!departmentId) return undefined;
    return departments.find((d) => d.id === departmentId)?.name;
  }

  const columns = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };
    projectTasks.forEach((t) => grouped[t.status].push(t));
    return grouped;
  }, [projectTasks]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) moveTask(taskId, status);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {STATUS_FLOW.map((status, i) => (
            <div key={status} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[status] }}
                />
                <span className="text-xs text-gray-500">{STATUS_LABELS[status]}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                  {columns[status].length}
                </span>
              </div>
              {i < STATUS_FLOW.length - 1 && (
                <span className="text-gray-300 text-xs">→</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDeptModal(true)}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <Settings size={12} />
            管理部门
          </button>
          <button
            onClick={() => setShowNewTask(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus size={14} />
            新建任务
          </button>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[60vh]">
        {STATUS_FLOW.map((status) => (
          <div
            key={status}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
            className={`flex-shrink-0 w-72 flex flex-col rounded-lg border transition-colors ${
              dragOverColumn === status
                ? 'border-blue-400 bg-blue-50/50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="px-3 py-2.5 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[status] }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {STATUS_LABELS[status]}
                </span>
                <span className="text-xs text-gray-400">{columns[status].length}</span>
              </div>
            </div>
            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
              {columns[status].map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                >
                  <div className="relative group">
                    <TaskCard
                      task={task}
                      departmentName={getDepartmentName(task.currentDepartmentId)}
                      onClick={() => setEditingTask(task)}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); setFlowTask(task); }}
                      className="absolute top-1.5 right-1.5 p-1 rounded opacity-0 group-hover:opacity-100 bg-white border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all"
                      title="流转记录"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="6" y1="3" x2="6" y2="15" />
                        <circle cx="18" cy="6" r="3" />
                        <circle cx="6" cy="18" r="3" />
                        <path d="M18 9a9 9 0 0 1-9 9" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              {columns[status].length === 0 && (
                <div className="text-center py-8 text-xs text-gray-400">
                  拖拽任务到此处
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showNewTask && <TaskModal onClose={() => setShowNewTask(false)} />}
      {editingTask && (
        <TaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}
      {flowTask && (
        <FlowLogModal
          task={flowTask}
          onClose={() => setFlowTask(null)}
        />
      )}
      {showDeptModal && currentProjectId && (
        <DepartmentModal
          projectId={currentProjectId}
          onClose={() => setShowDeptModal(false)}
        />
      )}
    </>
  );
}
