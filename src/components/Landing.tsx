import { ArrowRight, Layers, GitBranch, Users } from 'lucide-react';

interface LandingProps {
  onEnter: () => void;
}

export default function Landing({ onEnter }: LandingProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-4">
            ProjectFlow
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-lg mx-auto leading-relaxed">
            Track every task's journey across departments.
            <br className="hidden sm:block" />
            Stay aligned on what moves forward.
          </p>

          <button
            onClick={onEnter}
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Get Started
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center sm:text-left">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4 mx-auto sm:mx-0">
              <Layers size={20} className="text-gray-700" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Kanban Boards</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Visualize tasks across columns. Drag, drop, and move work through every stage.
            </p>
          </div>

          <div className="text-center sm:text-left">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4 mx-auto sm:mx-0">
              <GitBranch size={20} className="text-gray-700" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Department Flow</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Route tasks through your team's structure. Know exactly where each item sits.
            </p>
          </div>

          <div className="text-center sm:text-left">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4 mx-auto sm:mx-0">
              <Users size={20} className="text-gray-700" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Team Visibility</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Full audit trail on every task. See who touched what, and when.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 text-center text-xs text-gray-400 border-t border-gray-100">
        ProjectFlow &mdash; built for clarity
      </footer>
    </div>
  );
}
