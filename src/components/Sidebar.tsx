import { useStore } from '../store';
import { Plus, Trash2, FolderOpen } from 'lucide-react';

interface Props {
  onNewProject: () => void;
}

export default function Sidebar({ onNewProject }: Props) {
  const projects = useStore((s) => s.projects);
  const currentProjectId = useStore((s) => s.currentProjectId);
  const setCurrentProject = useStore((s) => s.setCurrentProject);
  const deleteProject = useStore((s) => s.deleteProject);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-300">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <span className="text-sm font-semibold text-white">项目列表</span>
        <button
          onClick={onNewProject}
          className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white"
          title="新建项目"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {projects.length === 0 && (
          <p className="px-4 py-8 text-center text-xs text-gray-500">
            暂无项目，点击 + 创建
          </p>
        )}
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => setCurrentProject(project.id)}
            className={`group flex items-center gap-2 px-4 py-2.5 cursor-pointer text-sm transition-colors ${
              currentProjectId === project.id
                ? 'bg-gray-800 text-white border-l-2 border-blue-500'
                : 'border-l-2 border-transparent hover:bg-gray-800/50 hover:text-white'
            }`}
          >
            <FolderOpen size={14} className="shrink-0" />
            <span className="flex-1 truncate">{project.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('确定删除项目"' + project.name + '"？')) {
                  deleteProject(project.id);
                }
              }}
              className="p-0.5 rounded hover:bg-gray-700 text-gray-500 hover:text-red-400"
              title="删除项目"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
