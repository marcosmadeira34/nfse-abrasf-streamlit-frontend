import { useState } from "react";
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
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "+55 (11) 99999-9999",
    location: "São Paulo, SP",
    bio: "Especialista em conversão de documentos e automação de processos. Trabalho com PDF e documentos digitais há mais de 5 anos.",
    company: "Tech Solutions Ltda",
    position: "Analista de Sistemas",
    joinDate: "2023-01-15"
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const stats = [
    { label: "Conversões", value: "1,247", icon: Activity },
    { label: "Arquivos Processados", value: "3.2 GB", icon: Shield },
    { label: "Tempo Economizado", value: "42.5h", icon: Award }
  ];

  const recentActivity = [
    {
      action: "Converteu documento",
      file: "Relatório_Anual.pdf",
      time: "2 horas atrás",
      status: "success"
    },
    {
      action: "Abriu ticket de suporte",
      file: "#TICKET-001",
      time: "1 dia atrás",
      status: "pending"
    },
    {
      action: "Baixou arquivo convertido",
      file: "Planilha_Custos.xlsx",
      time: "2 dias atrás",
      status: "success"
    }
  ];

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
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="" alt={profile.name} />
                    <AvatarFallback className="text-xl">
                      {profile.name.split(' ').map(n => n[0]).join('')}
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
                  <h3 className="text-xl font-semibold">{profile.name}</h3>
                  <p className="text-muted-foreground">{profile.position}</p>
                  <Badge variant="secondary" className="mt-1">
                    Membro desde {new Date(profile.joinDate).toLocaleDateString('pt-BR')}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editedProfile.name}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={editedProfile.phone}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Localização</Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      value={editedProfile.location}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, location: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  {isEditing ? (
                    <Input
                      id="company"
                      value={editedProfile.company}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, company: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2">
                      <span>{profile.company}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Cargo</Label>
                  {isEditing ? (
                    <Input
                      id="position"
                      value={editedProfile.position}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, position: e.target.value }))}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2">
                      <span>{profile.position}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={editedProfile.bio}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground p-2 bg-muted/30 rounded-md">
                    {profile.bio}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          <Card>
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
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-success' : 'bg-warning'
                    }`} />
                    <span className="text-sm font-medium">{activity.action}</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-4">
                    {activity.file} • {activity.time}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;