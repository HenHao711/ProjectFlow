import { useState } from 'react';
import { useStore } from '../store';
import { X, Trash2 } from 'lucide-react';
import { PRIORITY_LABELS } from '../types';
import type { Task } from '../types';

interface Props {
  task?: Task;
  onClose: () => void;
}

export default function TaskModal({ task, onClose }: Props) {
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const currentProjectId = useStore((s) => s.currentProjectId);
  const departments = useStore((s) => s.projects.find((p) => p.id === s.currentProjectId)?.departments ?? []);
  const setTaskDepartment = useStore((s) => s.setTaskDepartment);

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [assignee, setAssignee] = useState(task?.assignee ?? '');
  const [priority, setPriority] = useState<Task['priority']>(task?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '');
  const [selectedDeptId, setSelectedDeptId] = useState(task?.currentDepartmentId ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (task) {
      updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        assignee: assignee.trim(),
        priority,
        dueDate: dueDate || null,
      });
      if (selectedDeptId && selectedDeptId !== task.currentDepartmentId) {
        const dept = departments.find((d) => d.id === selectedDeptId);
        if (dept) setTaskDepartment(task.id, dept.id, dept.name);
      } else if (!selectedDeptId) {
        updateTask(task.id, { currentDepartmentId: null });
      }
    } else if (currentProjectId) {
      addTask({
        projectId: currentProjectId,
        title: title.trim(),
        description: description.trim(),
        assignee: assignee.trim(),
        priority,
        status: 'todo',
        dueDate: dueDate || null,
        currentDepartmentId: selectedDeptId || null,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (!task) return;
    if (confirm('确定删除任务"' + task.title + '"？')) {
      deleteTask(task.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            {task ? '编辑任务' : '新建任务'}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">任务标题</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入任务标题"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="输入任务描述（可选）"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">负责人</label>
              <input
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="负责人姓名"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task['priority'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p]} 优先级
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">截止日期</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">流转部门</label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">不指定部门</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {departments.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">暂无部门，请在项目管理中添加</p>
            )}
          </div>
          <div className="flex justify-between gap-2 pt-2">
            {task ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100"
              >
                <Trash2 size={14} />
                删除
              </button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {task ? '保存' : '创建'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
