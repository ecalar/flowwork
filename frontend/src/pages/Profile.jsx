export default function Profile() {
  const username = localStorage.getItem('flowwork_username') || 'Usuario';
  const token = localStorage.getItem('flowwork_token') || '';

  // Extraer el rol del token JWT (payload)
  const getRole = () => {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.role || 'Usuario';
    } catch {
      return 'Usuario';
    }
  };

  const initial = username.charAt(0).toUpperCase();

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-8">Perfil de Usuario</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {initial}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{username}</h3>
            <p className="text-slate-500">{getRole()}</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-500 mb-1">Usuario</label>
            <p className="text-slate-800 font-medium">{username}</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-500 mb-1">Rol</label>
            <p className="text-slate-800 font-medium">{getRole()}</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-500 mb-1">Token JWT</label>
            <p className="text-slate-400 text-xs break-all">{token.substring(0, 50)}...</p>
          </div>
        </div>
      </div>
    </div>
  );
}