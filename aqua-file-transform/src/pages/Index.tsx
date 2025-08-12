// Page Index.tsx

import { useState, useEffect } from "react";
import MetricsCard from "@/components/MetricsCard";
import FileUpload from "@/components/FileUpload";
import ConversionInterface from "@/components/ConversionInterface";
import { useTheme } from "@/hooks/useTheme";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SupportTicket from "@/components/SupportTicket";
import TicketManagement from "@/components/TicketManagement";

import { 
  FileText, 
  CheckCircle, 
  TrendingUp, 
  Clock,
  Zap,
  Shield,
  Moon,
  Sun,
} from "lucide-react";



const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [conversionComplete, setConversionComplete] = useState(false);
  const [conversionZipUrl, setConversionZipUrl] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [metrics, setMetrics] = useState({
    pdfsLoaded: 1247,
    processed: 1189,
    successRate: 95.3,
    timeSaved: 42.5
  });

  const handleLogout = () => {
    navigate("/");
  };

  const [taskId, setTaskId] = useState<string | null>(null);
  const [user, setUser] = useState(null);

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        pdfsLoaded: prev.pdfsLoaded + Math.floor(Math.random() * 3),
        processed: prev.processed + Math.floor(Math.random() * 2),
        successRate: Math.min(99.9, prev.successRate + (Math.random() - 0.5) * 0.1),
        timeSaved: prev.timeSaved + Math.random() * 0.5
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // useEffect(() => {
  //   const token = localStorage.getItem("access_token");
  //   const backendUrl = import.meta.env.VITE_DJANGO_BACKEND_URL;
  //   // console.log("Backend URL:", backendUrl);
  //   if (token) {
  //     axios.get(`${backendUrl}/user-profile/`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     .then((res) => {
  //       setUser(res.data);
  //       // console.log("Usuário logado:", res.data);
  //     })
  //     .catch((err) => console.error("Erro ao obter usuário", err));
  //   }
  // }, []);

  return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* <div className="p-2 rounded-lg gradient-primary"> */}
                  {/* <Zap className="w-6 h-6 text-primary-foreground" /> */}
                {/* </div> */}
                <div>
                  <h1 className="text-xl font-bold text-primary"></h1>
                  {/* <p className="text-sm text-muted-foreground">Automação de lançamentos NFS-e com I.A</p> */}
                </div>
                
              </div>
              {/* Icone de ajuda */}
                {/* <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-muted-foreground">Seguro & Rápido</span>
                </div> */}
              <div className="flex items-center gap-4">
                <SupportTicket />
                {/* <TicketManagement />                 */}
                {/* Botão de alternância de tema */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Alternar tema"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-800" />
                  )}
                </button>
                {/* Botão de Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5 text-red-500" />
                </button>

                {/* // Aqui colocar o nome do usuário logado
                <div className="text-sm text-muted-foreground">
                  Olá, <span className="font-medium text-foreground">{user?.username || "Usuário"}</span>
                </div> */}
              </div>
            </div>
          </div>
        </header>
        

      <main className="container mx-auto px-6 py-8">


        {/* Step 1: Upload */}
        {currentStep === 1 && (
          <section className="max-w-6xl mx-auto animate-fade-in">
            <div className="bg-card rounded-2xl border border-border/50 shadow-lg">
              <div className="px-8 py-4 text-center">
                <div className="w-14 h-14 mx-auto mb-6 rounded-lg gradient-primary flex items-center justify-center">
                  <FileText className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">
                  Gerenciar Fila de Conversão de Empresas
                </h3>
                {/* <p className="text-muted-foreground mb-8">
                  Selecione ou arraste seu arquivo PDF para começar a conversão
                </p> */}
                <FileUpload 
                  onQueueComplete={(queue) => {
                      console.log('Fila de conversão criada:', queue.name);
                    }}
                
                />
              </div>
            </div>
          </section>
        )}

        {/* Step 2: Conversion */}
        {currentStep === 2 && (
          <section className="max-w-4xl mx-auto animate-fade-in">
            <div className="bg-card rounded-2xl border border-border/50 shadow-lg">
              <div className="px-8 py-6 text-center">
                <div className="text-center mb-8">
                  <div className="w-14 h-14 mx-auto mb-6 rounded-lg gradient-secondary flex items-center justify-center">
                    <Zap className="w-8 h-8 text-secondary-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4">
                    Configure a conversão
                  </h3>
                  <p className="text-muted-foreground">
                    Escolha o formato desejado e inicie a conversão do arquivo: <span className="font-medium text-foreground">{uploadedFile?.name}</span>
                  </p>
                </div>

                <ConversionInterface
                initialFiles={Array.isArray(uploadedFile) ? uploadedFile : [uploadedFile]}
                onConversionComplete={({ zipUrl, taskId }) => {
                  setConversionZipUrl(zipUrl ?? null);
                  setTaskId(taskId ?? null);
                  setConversionComplete(true);
                  setCurrentStep(3);
                }}
              />



                <div className="mt-6 text-center">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Voltar para upload
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Step 3: Download */}
        {currentStep === 3 && conversionComplete && conversionZipUrl && (
        <section className="max-w-4xl mx-auto animate-fade-in">
          <div className="bg-card rounded-2xl border border-border/50 shadow-lg">
            <div className="px-8 py-6 text-center">
              <div className="w-14 h-14 mx-auto mb-6 rounded-lg gradient-primary flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                Conversão concluída!
              </h3>
              <p className="text-muted-foreground mb-8">
                Seu arquivo foi convertido com sucesso. Faça o download abaixo.
              </p>
              <div className="space-y-4">
                <a
                  href={conversionZipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-block text-center bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Download do arquivo convertido
                </a>
                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setUploadedFile(null);
                    setConversionComplete(false);
                    setConversionZipUrl(null);
                  }}
                  className="w-full bg-secondary text-secondary-foreground py-3 px-6 rounded-lg font-medium hover:bg-secondary/90 transition-colors"
                >
                  Converter novo arquivo
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

        {/* Additional Features */}
        {/* <section className="mt-16 text-center animate-fade-in" style={{ animationDelay: "400ms" }}>
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-foreground mb-8">
              Por que escolher nossa plataforma?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 mx-auto rounded-lg gradient-primary flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <h4 className="font-semibold text-foreground">Ultra Rápido</h4>
                <p className="text-muted-foreground text-sm">
                  Conversões em segundos com nossa tecnologia avançada
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 mx-auto rounded-lg gradient-secondary flex items-center justify-center">
                  <Shield className="w-6 h-6 text-secondary-foreground" />
                </div>
                <h4 className="font-semibold text-foreground">100% Seguro</h4>
                <p className="text-muted-foreground text-sm">
                  Seus documentos são protegidos com criptografia de ponta
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 mx-auto rounded-lg gradient-primary flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary-foreground" />
                </div>
                <h4 className="font-semibold text-foreground">Alta Precisão</h4>
                <p className="text-muted-foreground text-sm">
                  Algoritmos treinados de I.A garantem conversões precisas e confiáveis
                </p>
              </div>
            </div>
          </div>
        </section> */}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-border/50 bg-card/30">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              © 2025 - Transformando o complexo em simples com inteligência.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
