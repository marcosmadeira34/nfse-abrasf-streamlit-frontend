export async function callDjangoBackend(
  endpoint: string,
  method: "GET" | "POST" = "POST",
  jsonData?: object,
  fileData?: File[],
  timeout: number = 15000 // 15s padrão
) {
  const backendUrl = import.meta.env.VITE_DJANGO_BACKEND_URL;
  if (!backendUrl) {
    throw new Error("Backend URL não configurada em VITE_DJANGO_BACKEND_URL");
  }

  const url = `${backendUrl}${endpoint}`;
  const accessToken = localStorage.getItem("access_token");

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let body: FormData | string | undefined;

  // Caso de upload de arquivos
  if (fileData && fileData.length > 0) {
    const formData = new FormData();

    fileData.forEach((file) => {
      formData.append("files[]", file);
    });

    if (jsonData) {
      Object.entries(jsonData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    body = formData;
  } else if (jsonData) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(jsonData);
  }

  // Implementando timeout de rede
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Trata falha de autenticação explicitamente
    if (response.status === 401) {
      localStorage.removeItem("access_token");
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    if (!response.ok) {
      // Tenta extrair JSON ou texto do erro
      let errorMessage: string;
      try {
        const errJson = await response.json();
        errorMessage = errJson?.detail || JSON.stringify(errJson);
      } catch {
        errorMessage = await response.text();
      }
      throw new Error(`Erro ${response.status}: ${errorMessage}`);
    }

    // Tenta parsear JSON, se falhar retorna raw text
    try {
      return await response.json();
    } catch {
      return await response.text();
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("Timeout na requisição ao backend:", url);
      throw new Error("Tempo limite da requisição atingido");
    }
    console.error("Erro ao chamar backend:", error);
    throw new Error(error.message || "Erro desconhecido ao chamar backend");
  } finally {
    clearTimeout(timeoutId);
  }
}
