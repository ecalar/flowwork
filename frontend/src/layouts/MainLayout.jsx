import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Timer from '../components/Timer';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const username = localStorage.getItem('flowwork_username') || 'Usuario';

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Tareas', path: '/tasks' },
    { name: 'Chat', path: '/chat' },
    { name: 'Reportes', path: '/time-reports' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('flowwork_token');
    localStorage.removeItem('flowwork_username');
    localStorage.removeItem('selectedTaskId');
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      {/* Overlay para movil */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/70 backdrop-blur-xl border-r border-white/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
            FlowWork.
          </h1>
          <button onClick={closeSidebar} className="lg:hidden text-slate-500 hover:text-slate-700">
            X
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.name} to={item.path} onClick={closeSidebar}
                className={`block px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 font-medium'
                    : 'text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-900'
                }`}>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Timer solo en escritorio */}
        <div className="hidden lg:block px-4 mb-3">
          <Timer />
        </div>

        <div className="p-4 m-4 bg-white/80 rounded-xl border border-white/60 shadow-sm text-center">
          <Link to="/profile" onClick={closeSidebar} className="font-medium text-slate-700 hover:text-blue-600 transition-colors">
            {username}
          </Link>
          <p className="text-xs text-slate-500 mb-3">Developer</p>
          <button onClick={handleLogout}
            className="w-full text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 py-2 rounded-lg transition-colors">
            Cerrar Sesion
          </button>
        </div>
      </aside>

      {/* Boton menu movil */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 bg-white p-2 rounded-xl shadow-md border border-slate-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Timer flotante en movil */}
      <div className="lg:hidden fixed bottom-4 right-4 z-30 w-56">
        <Timer />
      </div>

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto pt-16 lg:pt-8">
        <Outlet />
      </main>
    </div>
  );
}