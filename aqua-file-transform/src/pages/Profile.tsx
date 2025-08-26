import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Award,
  Activity,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { callDjangoBackend } from "@/lib/api";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    user_name: "",
    phone_number: "",
    firm: "",
    email: "",
    role: "",
    created_at: ""
  });
  const [editedProfile, setEditedProfile] = useState(profile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Carregar dados do perfil do backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Usando a função callDjangoBackend com método GET
        const data = await callDjangoBackend("/api/profile/", "GET");
        setProfile(data);
        setEditedProfile(data);
      } catch (err) {
        setError(err.message);
        console.error('Erro ao carregar perfil:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      // Usando a função callDjangoBackend com método POST
      const updatedProfile = await callDjangoBackend("/api/profile/", "POST", editedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao salvar perfil:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
    setError(null);
  };

  const stats = [
    { label: "Conversões", value: "1,247", icon: Activity },
    { label: "Arquivos Processados", value: "3.2 GB", icon: Shield },
    { label: "Tempo Economizado", value: "42.5h", icon: Award }
  ];

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Meu Perfil
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas informações pessoais e preferências
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Pessoais
              </CardTitle>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="" alt={profile.user_name} />
                    <AvatarFallback className="text-xl">
                      {profile.user_name ? profile.user_name.split(' ').map(n => n[0]).join('') : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{profile.user_name || 'Nome não informado'}</h3>
                  <p className="text-muted-foreground">{profile.role}</p>
                  <Badge variant="secondary" className="mt-1">
                    Membro desde {profile.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
                  </Badge>
                </div>
              </div>
              <Separator />
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user_name">Nome Completo</Label>
                  {isEditing ? (
                    <Input
                      id="user_name"
                      value={editedProfile.user_name || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, user_name: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.user_name || 'Não informado'}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedProfile.email || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.email || 'Não informado'}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Telefone</Label>
                  {isEditing ? (
                    <Input
                      id="phone_number"
                      value={editedProfile.phone_number || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, phone_number: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.phone_number || 'Não informado'}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firm">Empresa</Label>
                  {isEditing ? (
                    <Input
                      id="firm"
                      value={editedProfile.firm || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, firm: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2">
                      <span>{profile.firm || 'Não informado'}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Cargo</Label>
                  {isEditing ? (
                    <Input
                      id="role"
                      value={editedProfile.role || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, role: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2">
                      <span>{profile.role || 'Não informado'}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <stat.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                  </div>
                  <span className="font-semibold">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
};

export default Profile;