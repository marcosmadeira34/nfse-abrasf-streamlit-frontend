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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ROICalculator from "@/components/ROICalculator";

import { 
  FileText, 
  CheckCircle, 
  TrendingUp, 
  Clock,
  Zap,
  Shield,
  Star,
  Users,
  Download,
  Play,
  ArrowRight,
  Award,
  Globe,
  Lock,
  Sparkles,
  ChevronRight,
  Mail,
  MessageSquare,
  Sun,
  Moon
} from "lucide-react";

const Homepage = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [conversionComplete, setConversionComplete] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    
    const [metrics, setMetrics] = useState({
        pdfsLoaded: 1247,
        processed: 1189,
        successRate: 95.3,
        timeSaved: 42.5
    });

    useEffect(() => {
    document.title = "Alivee - Automação de NFS-e Inteligente";
  }, []);
    // Component implementation will go here
    
 
    return (
    <div className="min-h-full bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="relative container mx-auto px-6 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-xl font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              🚀 Sua equipe fiscal no modo turbo
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent leading-tight">
              Esqueça digitação manual de NFS-e no Domínio.
              <span className="block text-gradient"></span>
            </h1>
            <p className="text-2xl text-muted-foreground mt-6 max-w-3xl mx-auto leading-relaxed">
              Nossa IA captura, processa e lança tudo sozinha.
              <span className="block text-gradient">Reduza custos, ganhe tempo e libere sua equipe para tarefas de alto valor.</span>

            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-6"
                  onClick={() => window.open('https://wa.me/5511982520721?text=Olá! Gostaria de saber mais informações sobre o Alivee, pode me ajudar?', '_blank')}
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Começar gratuitamente
                </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => window.location.href = "/login"}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Entrar na conta
              </Button>
            </div>
            <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
              {/* <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                Gratuito para começar
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                Sem cartão de crédito
              </div> */}
              {/* <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                Setup em 2 minutos
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-muted-foreground">Confiado por milhares de profissionais</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            <div className="text-center">
              <div className="font-bold text-2xl">50k+</div>
              <div className="text-sm text-muted-foreground">Usuários ativos</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl">2M+</div>
              <div className="text-sm text-muted-foreground">PDFs convertidos</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl">4.9★</div>
              <div className="text-sm text-muted-foreground">Avaliação média</div>
            </div>
          </div>
        </div>
      </section> */}

      <main className="container mx-auto px-6">
        {/* Features Section */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ⚡ Recursos que Impulsionam Sua Rotina Fiscal
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              O que faz da nossa plataforma a número 1 em automação de NFS-e no Domínio? Velocidade, precisão e inteligência trabalhando para você.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="relative group hover:shadow-lg transition-all duration-300 border-border/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>⚙️ Conversão em Segundos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Envie seu PDF. Nossa IA processa. Você recebe pronto. Tudo em nuvem, sem filas, sem espera.
                </p>
              </CardContent>
            </Card>
            
            <Card className="relative group hover:shadow-lg transition-all duration-300 border-border/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>🔒 Segurança de Nível Máximo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Criptografia ponta a ponta, exclusão automática e total conformidade. Seus dados sempre protegidos.
                </p>
              </CardContent>
            </Card>
            
            <Card className="relative group hover:shadow-lg transition-all duration-300 border-border/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>🔄 Integração Sem Dor de Cabeça</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Compatibilidade nativa com o Domínio. Conecte, rode e pronto — sem planilhas, sem ajustes manuais.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Interactive Demo Section */}
        {/* <section className="py-20 bg-muted/30 -mx-6 px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Experimente Agora Mesmo
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Faça upload de um PDF e veja a magia acontecer em tempo real
            </p>
          </div> */}

          {/* Step 1: Upload */}
          {/* {currentStep === 1 && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <Card className="shadow-xl border-border/50">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">
                    Faça o upload do seu PDF
                  </h3>
                  <p className="text-muted-foreground mb-8">
                    Selecione ou arraste seu arquivo PDF para começar a conversão
                  </p>
                  <FileUpload 
                    onQueueComplete={(queue) => {
                      console.log('Fila de conversão criada:', queue.name);
                    }}
                    
                  />
                </CardContent>
              </Card>
            </div>
          )} */}

          {/* Step 2: Conversion */}
          {/* {currentStep === 2 && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <Card className="shadow-xl border-border/50">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-lg bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center">
                      <Zap className="w-8 h-8 text-secondary-foreground" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-4">
                      Configure a conversão
                    </h3>
                    <p className="text-muted-foreground">
                      Escolha o formato desejado para: <span className="font-medium text-foreground">{uploadedFile?.name}</span>
                    </p>
                  </div>
                  <ConversionInterface 
                    initialFiles={uploadedFile ? [uploadedFile] : []}
                    onConversionComplete={() => {
                      setConversionComplete(true);
                      setCurrentStep(3);
                    }}
                  />
                  <div className="mt-6 text-center">
                    <Button 
                      variant="ghost" 
                      onClick={() => setCurrentStep(1)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ← Voltar para upload
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )} */}

          {/* Step 3: Download */}
          {/* {currentStep === 3 && conversionComplete && (
            <div className="max-w-2xl mx-auto animate-fade-in">
              <Card className="shadow-xl border-border/50">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">
                    Conversão concluída!
                  </h3>
                  <p className="text-muted-foreground mb-8">
                    Seu arquivo foi convertido com sucesso. Faça o download abaixo.
                  </p>
                  <div className="space-y-4">
                    <Button size="lg" className="w-full">
                      <Download className="w-5 h-5 mr-2" />
                      Download do arquivo convertido
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        setCurrentStep(1);
                        setUploadedFile(null);
                        setConversionComplete(false);
                      }}
                    >
                      Converter novo arquivo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </section> */}

        {/* Testimonials */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              💬 O que nossos clientes dizem
            </h2>
            <p className="text-xl text-muted-foreground">
              {/* Mais de 50.000 profissionais confiam em nossa plataforma */}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="relative border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Incrível! Economizo horas todos os dias. A qualidade da conversão é perfeita e o processo é super intuitivo."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Maria Silva</div>
                    <div className="text-sm text-muted-foreground">Advogada</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Nossa empresa aumentou a produtividade em 60% com um ROI incrível. A plataforma é essencial para nosso fluxo de trabalho."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mr-3">
                    <Award className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <div className="font-semibold">Carlos Santos</div>
                    <div className="text-sm text-muted-foreground">Diretor de TI</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Segurança e velocidade em um só lugar. Não consigo mais trabalhar sem essa ferramenta incrível."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Ana Costa</div>
                    <div className="text-sm text-muted-foreground">Contadora</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ROI Calculator Section */}
        <section className="py-20 bg-muted/30 -mx-6 px-6">
        <ROICalculator />
        </section>

        {/* Metrics Dashboard */}
        <section className="py-20 bg-muted/30 -mx-6 px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Métricas em Tempo Real
            </h2>
            <p className="text-xl text-muted-foreground">
              Acompanhe o poder da nossa plataforma em números
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricsCard
              title="PDFs Processados"
              value={metrics.pdfsLoaded.toLocaleString()}
              subtitle="Total de arquivos"
              trend="up"
              trendValue="+12% esta semana"
              icon={<FileText className="w-6 h-6" />}
              delay={0}
            />
            <MetricsCard
              title="Conversões Concluídas"
              value={metrics.processed.toLocaleString()}
              subtitle="Com sucesso"
              trend="up"
              trendValue="+8% esta semana"
              icon={<CheckCircle className="w-6 h-6" />}
              delay={100}
            />
            <MetricsCard
              title="Taxa de Sucesso"
              value={`${metrics.successRate.toFixed(1)}%`}
              subtitle="Precisão garantida"
              trend="up"
              trendValue="+2.1% esta semana"
              icon={<TrendingUp className="w-6 h-6" />}
              delay={200}
            />
            <MetricsCard
              title="Tempo Economizado"
              value={`${metrics.timeSaved.toFixed(1)}h`}
              subtitle="Hoje pelos usuários"
              trend="up"
              trendValue="+15% esta semana"
              icon={<Clock className="w-6 h-6" />}
              delay={300}
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-border/50">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pronto para transformar seu fluxo de trabalho?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Junte-se a milhares de profissionais que já economizam horas todos os dias
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-6"
                  onClick={() => window.open('https://wa.me/5511982520721?text=Olá! Gostaria de saber mais informações sobre o Alivee, pode me ajudar?', '_blank')}
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Começar gratuitamente
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-6"
                  onClick={() => window.open('https://wa.me/5511982520721?text=Olá! Gostaria de saber mais informações sobre o Alivee, pode me ajudar?', '_blank')}
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Falar com Especialista
                </Button>
              </div>
              <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  7 dias grátis
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Sem compromisso
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Suporte 24/7
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

      </main>

      {/* Newsletter Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-4">
            Fique por dentro das novidades
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Receba dicas exclusivas, atualizações de recursos e ofertas especiais diretamente no seu email
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="flex-1">
              <input
                type="email"
                placeholder="Seu melhor email"
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button size="lg">
              <Mail className="w-5 h-5 mr-2" />
              Inscrever
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Sem spam. Cancele quando quiser.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border/50">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              {/* <h4 className="font-semibold text-lg">PDF Patrimonium</h4> */}
              <p className="text-muted-foreground text-sm">
                A plataforma mais avançada para automação de NFS-e no seu sistema fiscal Domínio do Brasil.
              </p>
              <div className="flex items-center gap-4">
                {/* <SupportTicket />
                <TicketManagement /> */}
              </div>
            </div>
            
            <div className="space-y-4">
              <h5 className="font-semibold">Produto</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrações</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h5 className="font-semibold">Empresa</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Sobre nós</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h5 className="font-semibold">Suporte</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Política de Privacidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/50 mt-12 pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 PDF Patrimonium. Todos os direitos reservados. Transformando documentos com inteligência.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;