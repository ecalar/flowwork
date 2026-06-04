import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [tokenInput, setTokenInput] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (tokenInput.trim() !== '') {
      // Guardamos el token en el navegador de forma segura
      localStorage.setItem('flowwork_token', tokenInput.trim());
      // Redirigimos al Dashboard
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight mb-2">
            FlowWork.
          </h1>
          <p className="text-slate-500">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Token de Acceso (JWT)
            </label>
            <textarea
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Pega aquí tu token Bearer..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none h-32 text-sm text-slate-600 font-mono"
              required
            />
            <p className="text-xs text-slate-400 mt-2">
              *En un entorno de producción, aquí iría tu usuario y contraseña para generar el token.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md shadow-blue-500/30"
          >
            Entrar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
}