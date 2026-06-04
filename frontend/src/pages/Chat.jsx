export default function Chat() {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">Sala de Chat</h2>
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center min-h-[400px]">
        <p className="text-slate-400">Aquí conectaremos los WebSockets de RabbitMQ...</p>
      </div>
    </div>
  );
}