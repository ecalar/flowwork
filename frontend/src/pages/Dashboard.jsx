export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">Vista General</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta de prueba */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500 mb-1">Tareas Activas</p>
          <p className="text-4xl font-bold text-slate-800">12</p>
        </div>
      </div>
    </div>
  );
}