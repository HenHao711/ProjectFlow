import { useState } from 'react';
import { useStore } from './store';
import Header from './components/Header';
import Landing from './components/Landing';
import Sidebar from './components/Sidebar';
import KanbanBoard from './components/KanbanBoard';
import ProjectModal from './components/ProjectModal';

function EmptyState({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 py-20">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </div>
      <p className="text-sm mb-4">还没有项目，创建一个开始吧</p>
      <button
        onClick={onClick}
        className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        新建项目
      </button>
    </div>
  );
}

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const projects = useStore((s) => s.projects);
  const currentProjectId = useStore((s) => s.currentProjectId);

  if (showLanding) {
    return <Landing onEnter={() => setShowLanding(false)} />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header onLogoClick={() => setShowLanding(true)} />
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={() => useStore.getState().toggleSidebar()}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40 w-56 flex-shrink-0
            transform transition-transform duration-200
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:hidden'}
            lg:block
          `}
          style={{ top: '49px' }}
        >
          <Sidebar onNewProject={() => setShowProjectModal(true)} />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4">
          {projects.length === 0 ? (
            <EmptyState onClick={() => setShowProjectModal(true)} />
          ) : currentProjectId ? (
            <KanbanBoard />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              请从左侧选择一个项目
            </div>
          )}
        </main>
      </div>

      {showProjectModal && <ProjectModal onClose={() => setShowProjectModal(false)} />}
    </div>
  );
}
