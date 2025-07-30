import { useState } from "react";
import { 
  HelpCircle, 
  Search, 
  FileText, 
  MessageSquare, 
  Book,
  Video,
  Mail,
  Phone,
  ExternalLink,
  ChevronRight,
  Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqItems = [
    {
      question: "Como fazer upload de um arquivo PDF?",
      answer: "Para fazer upload de um PDF, clique no botão 'Escolher arquivo' na página inicial ou arraste o arquivo diretamente para a área de upload. Suportamos arquivos de até 50MB."
    },
    {
      question: "Quais formatos de conversão são suportados?",
      answer: "Suportamos conversão de PDF para DOCX, XLSX, PPTX, HTML, TXT e JPG. Também oferecemos conversão de outros formatos para PDF."
    },
    {
      question: "Quanto tempo leva para converter um arquivo?",
      answer: "A maioria das conversões é concluída em segundos. Arquivos maiores podem levar alguns minutos. Você receberá uma notificação quando a conversão estiver pronta."
    },
    {
      question: "Meus arquivos são seguros?",
      answer: "Sim, todos os arquivos são criptografados durante o upload e processamento. Arquivos são automaticamente excluídos após 30 dias para garantir sua privacidade."
    },
    {
      question: "Como posso entrar em contato com o suporte?",
      answer: "Você pode abrir um ticket de suporte através do botão 'Suporte' no header, enviar email para suporte@patrimonium.com ou ligar para (11) 9999-9999."
    },
    // {
    //   question: "Existe limite de conversões?",
    //   answer: "Usuários gratuitos têm limite de 10 conversões por mês. Planos pagos oferecem conversões ilimitadas e recursos adicionais."
    // }
  ];

  const quickGuides = [
    {
      title: "Primeiro Uso",
      description: "Como começar a usar a plataforma",
      icon: Book,
      steps: 4,
      time: "5 min"
    },
    {
      title: "Conversão Avançada",
      description: "Recursos avançados de conversão",
      icon: FileText,
      steps: 6,
      time: "10 min"
    },
    {
      title: "Gerenciar Tickets",
      description: "Como usar o sistema de suporte",
      icon: MessageSquare,
      steps: 3,
      time: "3 min"
    }
  ];

  const videoTutorials = [
    {
      title: "Introdução à Plataforma",
      description: "Visão geral de todos os recursos",
      duration: "8:30",
      views: "2.1k",
      rating: 4.8
    },
    {
      title: "Conversão PDF para Word",
      description: "Tutorial passo a passo",
      duration: "5:45",
      views: "1.8k",
      rating: 4.9
    },
    {
      title: "Configurações Avançadas",
      description: "Personalize sua experiência",
      duration: "12:15",
      views: "987",
      rating: 4.7
    }
  ];

  const contactOptions = [
    {
      title: "Email",
      description: "suporte@patrimonium.com",
      icon: Mail,
      responseTime: "Resposta em até 24h"
    },
    {
      title: "Telefone",
      description: "(11) 9999-9999",
      icon: Phone,
      responseTime: "Seg-Sex, 9h-18h"
    },
    {
      title: "Chat",
      description: "Chat online",
      icon: MessageSquare,
      responseTime: "Resposta imediata"
    }
  ];

  const filteredFaq = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Central de Ajuda
        </h1>
        <p className="text-muted-foreground mt-1">
          Encontre respostas, tutoriais e entre em contato conosco
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Busque por dúvidas, tutoriais ou recursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guides">Guias</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
          <TabsTrigger value="contact">Contato</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Perguntas Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFaq.length === 0 ? (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Nenhuma resposta encontrada
                  </h3>
                  <p className="text-muted-foreground">
                    Tente buscar com termos diferentes ou entre em contato conosco
                  </p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaq.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">{item.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickGuides.map((guide, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                      <guide.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {guide.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{guide.steps} passos</span>
                        <span>{guide.time}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Guia Completo de Uso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-between">
                  <span>Baixar Manual do Usuário (PDF)</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between">
                  <span>Documentação da API</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <div className="space-y-4">
            {videoTutorials.map((video, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10">
                      <Video className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">
                        {video.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {video.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">{video.duration}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {video.views} visualizações
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-muted-foreground">
                            {video.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline">
                      Assistir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactOptions.map((option, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-lg bg-primary/10">
                    <option.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {option.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {option.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {option.responseTime}
                  </p>
                  <Button className="w-full mt-4">
                    Entrar em Contato
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Horário de Atendimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Suporte Técnico</h4>
                  <p className="text-sm text-muted-foreground">
                    Segunda a Sexta: 9h às 18h<br />
                    Sábado: 9h às 14h<br />
                    Domingo: Fechado
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Emergências</h4>
                  <p className="text-sm text-muted-foreground">
                    Para problemas críticos que afetam<br />
                    operações em produção:<br />
                    24h por dia, 7 dias por semana
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Help;