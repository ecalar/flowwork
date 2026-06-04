import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate(); // Inicializamos el hook aquí

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Tareas', path: '/tasks' },
    { name: 'Sala de Chat', path: '/chat' },
  ];

  // Función para borrar el token y salir
  const handleLogout = () => {
    localStorage.removeItem('flowwork_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      {/* Sidebar con efecto Glassmorphism */}
      <aside className="w-64 bg-white/70 backdrop-blur-xl border-r border-white/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
            FlowWork.
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 font-medium'
                    : 'text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-900'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Tarjeta de usuario con botón de cerrar sesión */}
        <div className="p-4 m-4 bg-white/80 rounded-xl border border-white/60 shadow-sm text-center">
          <p className="font-medium text-slate-700">Enrique</p>
          <p className="text-xs text-slate-500 mb-3">Dev Backend</p>
          <button
            onClick={handleLogout}
            className="w-full text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 py-2 rounded-lg transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área de contenido principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}