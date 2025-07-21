import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

import { Player } from '@lottiefiles/react-lottie-player';
// ou
import Lottie from 'lottie-react';
import animationData from '@/assets/animation.json'; // baixe de https://lottiefiles.com/

// Componente separado com animação
function LoginMarketingSide() {
  return (
    <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-blue-900 text-white p-10">
      <motion.h1
        className="text-7xl font-bold mb-4"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Bem-vindo! 
      </motion.h1>

      <motion.p
        className="text-2xl max-w-2xl text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1 }}
      >
        Automatize, economize e escale seus lançamentos de NFS-e com eficiência e segurança.
      </motion.p>

      {/* Ilustração opcional */}
      {/* 
      <motion.img
        src="/login-illustration.svg"
        alt="Ilustração"
        className="w-2/3 mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
      />
      */}
    </div>
  );
}

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_DJANGO_BACKEND_URL;
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
      const token = localStorage.getItem("access_token");
      if (token) {
        navigate("/", { replace: true }); // 🔁 evita voltar para login via botão "voltar"
      }
    }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const erro = await response.json();
        setErro(erro.error || "Erro ao fazer login");
        setLoading(false);
        return;
      }

      const data = await response.json();
      const token = data.tokens.access_token;

      login(token);
      navigate("/", { replace: true });
            
      // Toast de sucesso moderno
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out';
      toast.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span>Login realizado com sucesso!</span>
        </div>
      `;
      document.body.appendChild(toast);
      
      // Remove o toast após 3 segundos
      setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 3000);
      window.location.href = "/";
    } catch {
      setErro("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Seção de marketing animada */}
      <LoginMarketingSide />

      {/* Seção de login */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-6 bg-gray-100">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
        >
          <h2 className="text-4xl font-bold mb-6 text-center">
            Acesse sua conta
          </h2>

          {erro && <div className="text-red-600 mb-4 text-sm">{erro}</div>}

          <label className="block mb-4">
            <span className="text-sm font-medium">Usuário</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded"
              required
            />
          </label>

          <label className="block mb-6">
            <span className="text-sm font-medium">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <p className="text-xs text-gray-500 text-center mt-4">
            Licenciado para Patrimonium Contabilidade
          </p>

        </form>
      </div>
    </div>
  );
}
