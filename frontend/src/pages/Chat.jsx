import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loaded, setLoaded] = useState(false);
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar historial al montar el componente
  useEffect(() => {
    const rawToken = localStorage.getItem('flowwork_token');
    const token = rawToken ? rawToken.replace('Bearer ', '') : '';

    fetch(`http://localhost:8084/api/chat/rooms/1/messages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      console.log('Historial cargado:', data);
      setMessages(data);
      setLoaded(true);
    })
    .catch(err => {
      console.error('Error:', err);
      setLoaded(true);
    });
  }, []);

  // Conectar WebSocket solo después de cargar el historial
  useEffect(() => {
    if (!loaded) return;

    const rawToken = localStorage.getItem('flowwork_token');
    const token = rawToken ? rawToken.replace('Bearer ', '') : '';

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8082/ws-chat'),
      connectHeaders: { token },
      onConnect: () => {
        client.subscribe('/topic/rooms/1', (message) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages((prev) => {
            const exists = prev.some(m => m.id === receivedMessage.id);
            return exists ? prev : [...prev, receivedMessage];
          });
        });
      },
      onStompError: (frame) => console.error('Error STOMP:', frame.headers['message']),
    });

    client.activate();
    stompClientRef.current = client;
    return () => client.deactivate();
  }, [loaded]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim() && stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          content: input.trim(),
          roomId: 1,
          senderId: 'Enrique',
        }),
      });
      setInput('');
    }
  };

  return (
    <div className="h-full flex flex-col max-h-[calc(100vh-6rem)] animate-fade-in">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">Sala de Chat (Proyecto 1)</h2>
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-slate-400">
              No hay mensajes aún. ¡Escribe el primero!
            </div>
          )}
          {messages.map((msg, index) => {
            const isMe = msg.senderId === 'Enrique';
            const isSystem = msg.senderId === 'SYSTEM';
            if (isSystem) {
              return (
                <div key={index} className="flex justify-center my-6">
                  <span className="bg-slate-200/50 text-slate-600 text-xs font-bold px-4 py-2 rounded-full border border-slate-200 backdrop-blur-sm shadow-sm">
                    {msg.content}
                  </span>
                </div>
              );
            }
            return (
              <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`max-w-[70%] px-5 py-3 shadow-sm ${
                  isMe ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm shadow-blue-500/20'
                       : 'bg-white text-slate-800 rounded-2xl rounded-bl-sm border border-slate-200'
                }`}>
                  {!isMe && <p className="text-xs font-bold text-slate-400 mb-1">{msg.senderId}</p>}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={sendMessage} className="flex gap-4">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
            <button type="submit" disabled={!input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md shadow-blue-500/30">
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}