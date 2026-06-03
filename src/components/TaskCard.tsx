import { PRIORITY_COLORS, PRIORITY_LABELS } from '../types';
import type { Task } from '../types';
import { Calendar, User } from 'lucide-react';

interface Props {
  task: Task;
  onClick: () => void;
  departmentName?: string;
}

export default function TaskCard({ task, onClick, departmentName }: Props) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-md border border-gray-200 p-3 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-2 mb-2">
        <span
          className="shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
          style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
          title={`${PRIORITY_LABELS[task.priority]} 优先级`}
        />
        <span className="text-sm text-gray-900 leading-snug line-clamp-2">{task.title}</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        {task.assignee && (
          <span className="flex items-center gap-1">
            <User size={11} />
            <span>{task.assignee}</span>
          </span>
        )}
        {task.dueDate && (
          <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
            <Calendar size={11} />
            <span>{task.dueDate}</span>
          </span>
        )}
        {task.currentDepartmentId && departmentName && (
          <span className="ml-auto text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full truncate max-w-[80px]">
            {departmentName}
          </span>
        )}
      </div>
    </div>
  );
}
