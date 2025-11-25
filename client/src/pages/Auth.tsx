import React, { useState } from "react";
import axios from "../services/api";

interface Props {
  onAuth: (token: string) => void;
}

const Auth: React.FC<Props> = ({ onAuth }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isRegister) {
        const res = await axios.post("/auth/register", { name, email, password, role });
        onAuth(res.data.token);
      } else {
        const res = await axios.post("/auth/login", { email, password });
        onAuth(res.data.token);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Request failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">{isRegister ? "Register" : "Login"}</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={submit} className="space-y-3">
        {isRegister && (
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full p-2 border rounded" />
        )}
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2 border rounded" />
        {isRegister && (
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-2 border rounded">
            <option value="customer">Customer</option>
            <option value="professional">Professional</option>
          </select>
        )}
        <div className="flex items-center justify-between">
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">
            {isRegister ? "Register" : "Login"}
          </button>
          <button type="button" onClick={() => setIsRegister(!isRegister)} className="underline text-sm">
            {isRegister ? "Have an account? Login" : "Create account"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Auth;
