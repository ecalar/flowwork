import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('El usuario es obligatorio');
      return;
    }
    if (!password.trim()) {
      setError('La contraseña es obligatoria');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isRegister ? 'register' : 'login';
      const response = await fetch(`http://localhost:8084/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Error en la solicitud');
      }

      const token = await response.text();

      if (token) {
        localStorage.setItem('flowwork_token', `Bearer ${token}`);
        if (rememberMe) {
          localStorage.setItem('remembered_user', username);
        } else {
          localStorage.removeItem('remembered_user');
        }
        navigate('/');
      } else {
        throw new Error('Token no recibido del servidor');
      }
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            FlowWork.
          </h1>
          <p className="text-slate-500 mt-2">
            {isRegister ? 'Crea tu cuenta' : 'Inicia sesion para continuar'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                error && !username.trim() ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
              }`}
              placeholder="Tu usuario"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                error && !password.trim() ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-500'
              }`}
              placeholder="Tu contraseña"
              autoComplete="current-password"
            />
          </div>

          {!isRegister && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember" className="text-sm text-slate-600">Recordarme</label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md shadow-blue-500/30"
          >
            {loading ? 'Procesando...' : isRegister ? 'Crear cuenta' : 'Iniciar sesion'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          {isRegister ? 'Ya tienes cuenta?' : 'No tienes cuenta?'}{' '}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-blue-600 font-bold hover:underline"
          >
            {isRegister ? 'Inicia sesion' : 'Registrate'}
          </button>
        </p>
      </div>
    </div>
  );
}