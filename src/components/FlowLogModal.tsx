import { useState } from 'react';
import { useStore } from '../store';
import { X, GitBranch, ArrowRight, MessageSquare, Clock } from 'lucide-react';
import type { Task } from '../types';

interface Props {
  task: Task;
  onClose: () => void;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function FlowLogModal({ task, onClose }: Props) {
  const projects = useStore((s) => s.projects);
  const setTaskDepartment = useStore((s) => s.setTaskDepartment);
  const addFlowNote = useStore((s) => s.addFlowNote);

  const departments = projects.find((p) => p.id === task.projectId)?.departments ?? [];
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [note, setNote] = useState('');

  const sortedLogs = [...task.flowLogs].sort((a, b) => b.enteredAt - a.enteredAt);

  const handleTransfer = () => {
    if (!selectedDeptId) return;
    const dept = departments.find((d) => d.id === selectedDeptId);
    if (dept) {
      setTaskDepartment(task.id, dept.id, dept.name);
      setSelectedDeptId('');
    }
  };

  const handleAddNote = () => {
    if (!note.trim()) return;
    const deptName = departments.find((d) => d.id === task.currentDepartmentId)?.name ?? '未知部门';
    addFlowNote(task.id, task.currentDepartmentId ?? '', deptName, note.trim());
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <GitBranch size={16} className="text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">流转记录</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Current department */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-xs text-blue-600 mb-1">当前部门</p>
            <p className="text-sm font-medium text-blue-900">
              {departments.find((d) => d.id === task.currentDepartmentId)?.name ?? '未指定'}
            </p>
          </div>

          {/* Transfer */}
          {departments.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">流转到部门</p>
              <div className="flex gap-2">
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">选择部门</option>
                  {departments
                    .filter((d) => d.id !== task.currentDepartmentId)
                    .map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
                <button
                  onClick={handleTransfer}
                  disabled={!selectedDeptId}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowRight size={14} />
                  流转
                </button>
              </div>
            </div>
          )}

          {/* Add note */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">添加备注</p>
            <div className="flex gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入流转备注..."
              />
              <button
                onClick={handleAddNote}
                disabled={!note.trim()}
                className="flex items-center gap-1 px-3 py-2 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <MessageSquare size={14} />
                备注
              </button>
            </div>
          </div>

          {/* Flow history */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">流转历史</p>
            {sortedLogs.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">暂无流转记录</p>
            ) : (
              <div className="space-y-2">
                {sortedLogs.map((log, i) => (
                  <div
                    key={log.id}
                    className={`border rounded-md p-3 ${
                      log.completedAt === null
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">{log.departmentName}</span>
                      {log.completedAt === null ? (
                        <span className="text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                          进行中
                        </span>
                      ) : (
                        <span className="text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                          已完成
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={10} />
                      <span>{formatTime(log.enteredAt)}</span>
                    </div>
                    {log.note && (
                      <p className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                        {log.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
