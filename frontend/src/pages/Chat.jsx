import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useToast } from '../context/ToastContext';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [taskId, setTaskId] = useState(() => localStorage.getItem('selectedTaskId') || '1');
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const { addToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const rawToken = localStorage.getItem('flowwork_token');
    const token = rawToken ? rawToken.replace('Bearer ', '') : '';

    fetch(`http://localhost:8082/api/chat/rooms/${taskId}/messages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setMessages(data))
    .catch(err => console.error('Error:', err));

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8082/ws-chat'),
      connectHeaders: { token },
      onConnect: () => {
        subscriptionRef.current = client.subscribe(`/topic/rooms/${taskId}`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages((prev) => {
            if (prev.some(m => m.id === receivedMessage.id)) return prev;
            return [...prev, receivedMessage];
          });
          scrollToBottom();
        });
      },
      onStompError: (frame) => console.error('Error STOMP:', frame.headers['message']),
    });

    client.activate();
    stompClientRef.current = client;

    return () => client.deactivate();
  }, []);

  const changeRoom = (newTaskId) => {
    setTaskId(newTaskId);

    const rawToken = localStorage.getItem('flowwork_token');
    const token = rawToken ? rawToken.replace('Bearer ', '') : '';
    fetch(`http://localhost:8082/api/chat/rooms/${newTaskId}/messages`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setMessages(data))
    .catch(err => console.error('Error:', err));

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
    if (stompClientRef.current?.connected) {
      subscriptionRef.current = stompClientRef.current.subscribe(`/topic/rooms/${newTaskId}`, (message) => {
        const receivedMessage = JSON.parse(message.body);
        setMessages((prev) => {
          if (prev.some(m => m.id === receivedMessage.id)) return prev;
          return [...prev, receivedMessage];
        });
        scrollToBottom();
      });
    }
  };

  useEffect(() => {
    const handler = () => {
      const newId = localStorage.getItem('selectedTaskId') || '1';
      if (newId !== taskId) {
        changeRoom(newId);
      }
    };
    window.addEventListener('taskChanged', handler);
    return () => window.removeEventListener('taskChanged', handler);
  }, [taskId]);

  const sendMessage = (e) => {
    e.preventDefault();
    const currentTaskId = localStorage.getItem('selectedTaskId') || '1';
    if (input.trim() && stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          content: input.trim(),
          roomId: parseInt(currentTaskId),
          senderId: localStorage.getItem('flowwork_username') || 'Enrique',
        }),
      });
      addToast('Mensaje enviado', 'info');
      setInput('');
    }
  };

  const clearSelection = () => {
    localStorage.removeItem('selectedTaskId');
    changeRoom('1');
  };

  return (
    <div className="h-full flex flex-col max-h-[calc(100vh-6rem)] animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Sala de Chat {taskId !== '1' ? `(Tarea #${taskId})` : 'General'}
        </h2>
        <div className="flex gap-2">
          {taskId !== '1' && (
            <button onClick={clearSelection}
              className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 py-1.5 rounded-lg transition-colors font-medium">
              Ver chat general
            </button>
          )}
          {taskId === '1' && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
              Selecciona una tarea en "Tareas"
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-slate-400">
              No hay mensajes aun. Escribe el primero!
            </div>
          )}
          {messages.map((msg, index) => {
              const currentUser = localStorage.getItem('flowwork_username') || 'Enrique';
              const isMe = msg.senderId === currentUser;
            const isSystem = msg.senderId === 'SYSTEM';
            if (isSystem) {
              return (
                <div key={index} className="flex justify-center my-6">
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-4 py-2 rounded-full border border-green-200 shadow-sm">
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