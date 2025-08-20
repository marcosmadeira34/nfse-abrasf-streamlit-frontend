import { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  Download,
  Trash2,
  Save,
  Eye,
  EyeOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { callDjangoBackend } from "@/lib/api";



const Settings = () => {
  const [notifications, setNotifications] = useState({
    emailConversions: true,
    emailTickets: true,
    pushNotifications: false,
    weeklyReport: true
  });

  const [preferences, setPreferences] = useState({
    theme: "system",
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    autoDownload: false,
    deleteAfterDays: "30"
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: "24",
    loginNotifications: true
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [saveStatus, setSaveStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

   // Carregar configurações do backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const data = await callDjangoBackend('/api/user-settings/', 'GET');
        if (data.success) {
          setNotifications(data.settings.notifications);
          setPreferences(data.settings.preferences);
          setSecurity(data.settings.security);
          setApiKey(data.settings.api_key);
          // Aplicar as configurações carregadas
          applySettings(data.settings);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  // Função para aplicar as configurações no sistema
  const applySettings = (settings) => {
    // Aplicar tema
    applyTheme(settings.preferences.theme);
    
    // Aplicar configurações de download automático
    applyAutoDownload(settings.preferences.autoDownload);
    
    // Aplicar configurações de exclusão automática
    applyAutoDelete(settings.preferences.deleteAfterDays);
    
    // Aplicar configurações de notificações
    applyNotifications(settings.notifications);
    
    // Aplicar configurações de API
    applyApiSettings(settings.api_key);
  };

  // Função para aplicar o tema
  const applyTheme = (theme) => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // Sistema: verificar preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    
    // Salvar preferência de tema no localStorage para persistência entre sessões
    localStorage.setItem('theme', theme);
  };

  // Função para aplicar configurações de download automático
  const applyAutoDownload = (autoDownload) => {
    // Salvar no localStorage para uso em outras partes do aplicativo
    localStorage.setItem('autoDownload', autoDownload.toString());
    
    // Aqui você pode adicionar lógica adicional se necessário
    console.log('Download automático:', autoDownload ? 'Ativado' : 'Desativado');
  };

  // Função para aplicar configurações de exclusão automática
  const applyAutoDelete = (deleteAfterDays) => {
    // Salvar no localStorage para uso em outras partes do aplicativo
    localStorage.setItem('deleteAfterDays', deleteAfterDays);
    
    // Aqui você pode adicionar lógica adicional se necessário
    console.log('Exclusão automática após:', deleteAfterDays === 'never' ? 'Nunca' : `${deleteAfterDays} dias`);
  };

  // Função para aplicar configurações de notificações
  const applyNotifications = (notifications) => {
    // Salvar no localStorage para uso em outras partes do aplicativo
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // Aqui você pode adicionar lógica adicional se necessário
    console.log('Notificações:', notifications);
    
    // Se as notificações push estiverem ativadas, solicitar permissão
    if (notifications.pushNotifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  };

  // Função para aplicar configurações de API
  const applyApiSettings = (apiKey) => {
    // Salvar no localStorage para uso em outras partes do aplicativo
    localStorage.setItem('apiKey', apiKey);
    
    // Aqui você pode adicionar lógica adicional se necessário
    console.log('Chave de API:', apiKey);
  };

  // Salvar configurações no backend
  const saveSettings = async () => {
    try {
      const data = await callDjangoBackend(
        '/api/user-settings/', 
        'POST',
        {
          notifications,
          preferences,
          security
        }
      );
      
      if (data.success) {
        // Aplicar as configurações salvas
        applySettings({ notifications, preferences, security, api_key: apiKey });
        setSaveStatus('success');
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setSaveStatus('error');
    }
    
    // Limpar o status após 3 segundos
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Gerar nova chave de API
  const generateNewApiKey = async () => {
    try {
      const data = await callDjangoBackend('/api/generate-api-key/', 'POST');
      if (data.success) {
        setApiKey(data.api_key);
        applyApiSettings(data.api_key);
        setSaveStatus('api-generated');
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Erro ao gerar chave de API:', error);
      setSaveStatus('error');
    }
    
    // Limpar o status após 3 segundos
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Excluir conta
  const handleDeleteAccount = async () => {
    try {
      const data = await callDjangoBackend(
        '/api/delete-account/', 
        'POST',
        {
          password: deletePassword
        }
      );
      
      if (data.success) {
        // Fazer logout e redirecionar para página de login
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else {
        setDeleteError(data.error || 'Erro ao excluir conta');
      }
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      setDeleteError('Erro ao excluir conta');
    }
  };

  if (isLoading) {
    return <div className="p-6">Carregando configurações...</div>;
  }



  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Personalize sua experiência e gerencie suas preferências
        </p>
      </div>

      {/* Status de salvamento */}
      {saveStatus && (
        <div className={`p-3 rounded-md ${
          saveStatus === 'success' ? 'bg-green-100 text-green-800' : 
          saveStatus === 'error' ? 'bg-red-100 text-red-800' : 
          saveStatus === 'api-generated' ? 'bg-blue-100 text-blue-800' : 
          'bg-gray-100 text-gray-800'
        }`}>
          {saveStatus === 'success' && 'Configurações salvas com sucesso!'}
          {saveStatus === 'error' && 'Erro ao salvar configurações. Tente novamente.'}
          {saveStatus === 'api-generated' && 'Nova chave de API gerada com sucesso!'}
        </div>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>


        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Aparência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Select value={preferences.theme} onValueChange={(value) => {
                  setPreferences(prev => ({ ...prev, theme: value }));
                  // Aplicar o tema imediatamente
                  applyTheme(value);
                }}>

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Select value={preferences.language} onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, language: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário</Label>
                <Select value={preferences.timezone} onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, timezone: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                    <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Conversões
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Download Automático</Label>
                  <p className="text-sm text-muted-foreground">
                    Baixar automaticamente arquivos após conversão
                  </p>
                </div>
                <Switch
                  checked={preferences.autoDownload}
                  onCheckedChange={(checked) => {
                    setPreferences(prev => ({ ...prev, autoDownload: checked }));
                    // Aplicar a configuração imediatamente
                    applyAutoDownload(checked);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deleteAfterDays">Exclusão Automática</Label>
                <Select value={preferences.deleteAfterDays} onValueChange={(value) => {
                  setPreferences(prev => ({ ...prev, deleteAfterDays: value }));
                  // Aplicar a configuração imediatamente
                  applyAutoDelete(value);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                    <SelectItem value="never">Nunca</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Arquivos serão excluídos automaticamente após este período
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Preferências de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Conversões por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber email quando conversões forem concluídas
                  </p>
                </div>
                <Switch
                  checked={notifications.emailConversions}
                  onCheckedChange={(checked) => {
                    setNotifications(prev => ({ ...prev, emailConversions: checked }));
                    // Aplicar a configuração imediatamente
                    applyNotifications({ ...notifications, emailConversions: checked });
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Tickets por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber email sobre atualizações de tickets
                  </p>
                </div>
                <Switch
                  checked={notifications.emailTickets}
                  onCheckedChange={(checked) => {
                    setNotifications(prev => ({ ...prev, emailTickets: checked }));
                    // Aplicar a configuração imediatamente
                    applyNotifications({ ...notifications, emailTickets: checked });
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações push no navegador
                  </p>
                </div>
                <Switch
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, pushNotifications: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Relatório Semanal</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber resumo semanal de atividades
                  </p>
                </div>
                <Switch
                  checked={notifications.weeklyReport}
                  onCheckedChange={(checked) => {
                    setNotifications(prev => ({ ...prev, weeklyReport: checked }));
                    // Aplicar a configuração imediatamente
                    applyNotifications({ ...notifications, weeklyReport: checked });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Segurança da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-muted-foreground">
                    Adicione uma camada extra de segurança à sua conta
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={security.twoFactorAuth ? "secondary" : "outline"}>
                    {security.twoFactorAuth ? "Ativo" : "Inativo"}
                  </Badge>
                  <Switch
                    checked={security.twoFactorAuth}
                    onCheckedChange={(checked) => 
                      setSecurity(prev => ({ ...prev, twoFactorAuth: checked }))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Timeout de Sessão</Label>
                <Select value={security.sessionTimeout} onValueChange={(value) => 
                  setSecurity(prev => ({ ...prev, sessionTimeout: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hora</SelectItem>
                    <SelectItem value="8">8 horas</SelectItem>
                    <SelectItem value="24">24 horas</SelectItem>
                    <SelectItem value="168">7 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Notificações de Login</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber email quando houver login de novo dispositivo
                  </p>
                </div>
                <Switch
                  checked={security.loginNotifications}
                  onCheckedChange={(checked) => 
                    setSecurity(prev => ({ ...prev, loginNotifications: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  Alterar Senha
                </Button>
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir Conta
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Confirmar Exclusão de Conta</DialogTitle>
                      <DialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta e removerá seus dados de nossos servidores.
                      </DialogDescription>
                    </DialogHeader>
                    
                    {deleteError && (
                      <Alert variant="destructive">
                        <AlertDescription>{deleteError}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Digite sua senha para confirmar</Label>
                        <Input
                          id="password"
                          type="password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleDeleteAccount}
                        disabled={!deletePassword}
                      >
                        Excluir Conta
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Configurações de API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="apiKey">Chave da API</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="apiKey"
                      type={showApiKey ? "text" : "password"}
                      value="sk_1234567890abcdef"
                      readOnly
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button variant="outline">
                    Gerar Nova
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use esta chave para integrar com a API do sistema
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Limites de API</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Requisições/hora</p>
                    <p className="text-2xl font-bold">1,000</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Usado este mês</p>
                    <p className="text-2xl font-bold">2,847</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  Documentação da API
                </Button>
                <Button variant="outline" className="w-full">
                  Exemplos de Código
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="flex items-center gap-2" onClick={saveSettings}>
          <Save className="w-4 h-4" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default Settings;