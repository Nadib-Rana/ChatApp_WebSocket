import React, { useEffect, useState, useRef } from "react";
import axios from "../services/api";
import dotnet from "dotenv";
import { connectWebSocket, buildWsUrl } from "../services/ws";

interface Props {
  token: string;
  onLogout: () => void;
}

interface IUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface IMessage {
  _id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt?: string;
}

const API_URL =  "http://localhost:5005";

const Chat: React.FC<Props> = ({ token, onLogout }) => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [selected, setSelected] = useState<IUser | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await axios.get("/users");
        setUsers(res.data.filter((u: IUser) => u._id));
      } catch (err) {
        console.error(err);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    // connect websocket
    wsRef.current = connectWebSocket(API_URL, token, (data) => {
      // incoming message structure: { senderId, content }
      if (data && data.senderId && data.content) {
        // if message is part of current conversation, append
        if (selected && data.senderId === selected._id) {
          setMessages((m) => [...m, { senderId: data.senderId, receiverId: "", content: data.content, createdAt: new Date().toISOString() }]);
        }
      }
    });

    return () => {
      wsRef.current?.close();
    };
  }, [token, selected]);

  const openConversation = async (user: IUser) => {
    setSelected(user);
    try {
      const res = await axios.get(`/messages/${user._id}`);
      setMessages(res.data || []);
    } catch (err) {
      console.error(err);
      setMessages([]);
    }
  };

  const sendMessage = (content: string) => {
    if (!selected) return;
    const payload = { receiverId: selected._id, content };
    // optimistic UI
    setMessages((m) => [...m, { senderId: "me", receiverId: selected._id, content, createdAt: new Date().toISOString() }]);
    try {
      wsRef.current?.send(JSON.stringify(payload));
    } catch (err) {
      console.error("WS send error", err);
    }
  };

  return (
    <div className="h-full flex">
      <aside className="w-72 border-r bg-white">
        <div className="p-4 flex items-center justify-between">
          <h3 className="font-semibold">Contacts</h3>
          <button onClick={onLogout} className="text-sm text-red-600">Logout</button>
        </div>
        <ul>
          {users.map((u) => (
            <li key={u._id} className={`p-3 cursor-pointer hover:bg-gray-100 ${selected?._id === u._id ? 'bg-gray-100' : ''}`} onClick={() => openConversation(u)}>
              <div className="font-medium">{u.name}</div>
              <div className="text-xs text-gray-500">{u.role}</div>
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1 p-4 flex flex-col">
        {!selected ? (
          <div className="m-auto text-gray-500">Select a contact to start chatting</div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="border-b p-3 font-semibold">{selected.name}</div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`max-w-xs p-2 rounded ${m.senderId === 'me' ? 'bg-indigo-600 text-white ml-auto' : 'bg-gray-200 text-gray-900'}`}>
                  {m.content}
                  <div className="text-xs text-gray-500 mt-1">{m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}</div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t">
              <MessageInput onSend={sendMessage} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const MessageInput: React.FC<{ onSend: (content: string) => void }> = ({ onSend }) => {
  const [text, setText] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };
  return (
    <form onSubmit={submit} className="flex gap-2">
      <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Type a message..." />
      <button className="px-4 py-2 bg-indigo-600 text-white rounded">Send</button>
    </form>
  );
};

export default Chat;
