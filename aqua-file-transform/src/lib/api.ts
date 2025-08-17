export async function callDjangoBackend(
  endpoint: string,
  method: "GET" | "POST" = "POST",
  jsonData?: object,
  fileData?: File[]
) {
  const backendUrl = import.meta.env.VITE_DJANGO_BACKEND_URL;
  const url = `${backendUrl}${endpoint}`;
  // console.log("Calling backend URL:", url);

  const accessToken = localStorage.getItem("access_token");
  // console.log("Access token usado:", accessToken);

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let body: FormData | string | undefined;

  if (fileData && fileData.length > 0) {
    // console.log("fileData recebido:", fileData);

    const formData = new FormData();
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    // console.log("Recebendo arquivos ao FormData:", fileData);

    fileData.forEach((file) => {
      formData.append("files[]", file);
    });

    if (jsonData) {
      Object.entries(jsonData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    for (const [key, value] of formData.entries()) {
      console.log("Conteúdo do FormData:", key, value);
    }

    body = formData;
  } else if (jsonData) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(jsonData);
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    console.log("Response from backend:", response);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Erro ${response.status}: ${text}`);
    }

    const responseJson = await response.json();
    // console.log("Resposta do backend:", responseJson);
    return responseJson;
  } catch (error: any) {
    console.error("Erro ao chamar backend:", error.message);
    throw error;
  }
}
