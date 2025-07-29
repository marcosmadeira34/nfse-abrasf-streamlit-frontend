// src/components/LogoutPage.tsx
import { useEffect, useState } from "react";

const Logout = () => {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!confirmed) {
      const shouldLogout = window.confirm("Você tem certeza que deseja sair?");
      if (shouldLogout) {
        setConfirmed(true);
      } else {
        // Redireciona de volta para o app ou página anterior
        window.history.back(); // ou window.location.href = "/app";
      }
    } else {
      // Logout confirmado, execute a limpeza
      localStorage.removeItem("access_token");
      sessionStorage.clear();

      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Redirecionar para a home
      const frontendUrl = import.meta.env.VITE_FRONTEND_URL;
      window.location.href = `${frontendUrl}/`;
    }
  }, [confirmed]);

  return <p>{confirmed ? "Saindo... Redirecionando." : "Aguardando confirmação..."}</p>;
};

export default Logout;
