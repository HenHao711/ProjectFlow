import { useState } from 'react';
import { useStore } from '../store';
import { X, Plus, Trash2, Check, Pencil } from 'lucide-react';

interface Props {
  projectId: string;
  onClose: () => void;
}

export default function DepartmentModal({ projectId, onClose }: Props) {
  const projects = useStore((s) => s.projects);
  const addDepartment = useStore((s) => s.addDepartment);
  const removeDepartment = useStore((s) => s.removeDepartment);
  const updateDepartment = useStore((s) => s.updateDepartment);

  const departments = projects.find((p) => p.id === projectId)?.departments ?? [];
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    addDepartment(projectId, newName.trim());
    setNewName('');
  };

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      updateDepartment(projectId, editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">部门管理</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {/* Add new */}
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入部门名称"
            />
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* List */}
          {departments.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-4">暂无部门，在上方添加</p>
          ) : (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 group"
                >
                  {editingId === dept.id ? (
                    <>
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button onClick={handleSaveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded">
                        <Check size={15} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-gray-700">{dept.name}</span>
                      <button
                        onClick={() => handleStartEdit(dept.id, dept.name)}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 text-gray-400"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => removeDepartment(projectId, dept.id)}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
