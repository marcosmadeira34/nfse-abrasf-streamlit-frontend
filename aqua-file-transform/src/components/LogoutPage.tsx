// src/components/LogoutPage.tsx

import { useEffect } from "react";

const Logout = () => {
  useEffect(() => {
    // 1. Remover token armazenado
    localStorage.removeItem("access_token");
    sessionStorage.clear(); // remove qualquer outra coisa relacionada

    // 2. Remover cookies (simples)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // 3. Redirecionar para a página de login
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL;
    window.location.href = `${frontendUrl}/login`;
  }, []);

  return <p>Saindo... Redirecionando para login.</p>;
};

export default Logout;