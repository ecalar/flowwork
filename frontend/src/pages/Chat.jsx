import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll al último mensaje cuando llega uno nuevo
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Inicializamos el cliente STOMP conectándolo a nuestro Gateway
    const client = new Client({
      // Usamos SockJS para conectarnos al endpoint del Chat Service a través del Gateway
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-chat'),
      debug: (str) => {
        console.log('STOMP: ', str);
      },
      onConnect: () => {
        console.log('🔌 ¡Conectado a la Sala de Chat!');

        // Nos suscribimos a la sala 1
        client.subscribe('/topic/rooms/1', (message) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, receivedMessage]);
        });
      },
      onStompError: (frame) => {
        console.error('Error STOMP:', frame.headers['message']);
      },
    });

    // Activar conexión
    client.activate();
    stompClientRef.current = client;

    // Desconectar al salir de la pantalla
    return () => {
      client.deactivate();
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim() && stompClientRef.current?.connected) {
      // Estructura del DTO que espera nuestro ChatWebSocketController
      const chatMessage = {
        content: input.trim(),
        roomId: 1,
        senderId: 'Enrique', // Tu usuario actual
      };

      // Enviamos el mensaje al backend
      stompClientRef.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(chatMessage),
      });

      setInput('');
    }
  };

  return (
    <div className="h-full flex flex-col max-h-[calc(100vh-6rem)] animate-fade-in">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">Sala de Chat (Proyecto 1)</h2>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">

        {/* Zona de mensajes */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-slate-400">
              No hay mensajes aún. ¡Escribe el primero!
            </div>
          )}

          {messages.map((msg, index) => {
            const isMe = msg.senderId === 'Enrique';
            const isSystem = msg.senderId === 'SYSTEM';

            // Diseño especial para los mensajes automáticos de RabbitMQ
            if (isSystem) {
              return (
                <div key={index} className="flex justify-center my-6">
                  <span className="bg-slate-200/50 text-slate-600 text-xs font-bold px-4 py-2 rounded-full border border-slate-200 backdrop-blur-sm shadow-sm">
                    {msg.content}
                  </span>
                </div>
              );
            }

            // Diseño para mensajes humanos
            return (
              <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`max-w-[70%] px-5 py-3 shadow-sm ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm shadow-blue-500/20'
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

        {/* Zona de Input de texto */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={sendMessage} className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md shadow-blue-500/30"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}