import { useStore } from '../store';
import { Menu, Trash2 } from 'lucide-react';

export default function Header() {
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const projects = useStore((s) => s.projects);
  const currentProjectId = useStore((s) => s.currentProjectId);
  const deleteProject = useStore((s) => s.deleteProject);

  const currentProject = projects.find((p) => p.id === currentProjectId);

  return (
    <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
      <button
        onClick={toggleSidebar}
        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 lg:hidden"
      >
        <Menu size={20} />
      </button>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="text-sm font-semibold text-blue-600 shrink-0">ProjectFlow</span>
        {currentProject && (
          <>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-700 truncate">{currentProject.name}</span>
          </>
        )}
      </div>
      {currentProject && (
        <button
          onClick={() => {
            if (confirm('确定删除项目"' + currentProject.name + '"及其所有任务？此操作不可恢复。')) {
              deleteProject(currentProject.id);
            }
          }}
          className="flex items-center gap-1 px-2 py-1.5 text-xs text-red-600 bg-red-50 rounded-md hover:bg-red-100"
          title="删除项目"
        >
          <Trash2 size={14} />
          <span className="hidden sm:inline">删除项目</span>
        </button>
      )}
    </header>
  );
}
