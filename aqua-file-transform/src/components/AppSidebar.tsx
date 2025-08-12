import { useState } from "react"
import { 
  Home, 
  FileText, 
  CheckSquare,
  Send,
  MessageSquare, 
  Settings, 
  User, 
  HelpCircle,
  Bell,
  ChevronRight,
  Zap,
  Shield,
  BarChart3
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { useTickets } from "@/hooks/use-tickets"

const mainNavItems = [
  { 
    title: "Início", 
    url: "/dashboard", 
    icon: Home,
    description: "Faça upload de arquivos PDF",
  },
  // { 
  //   title: "Validação XML", 
  //   url: "/xml-validation", 
  //   icon: CheckSquare,
  //   description: "Valide arquivos XML"
  // },
  // { 
  //   title: "Integração API", 
  //   url: "/api-integration", 
  //   icon: Send,
  //   description: "Envio para APIs externas"
  // },
  //  { 
  //   title: "Conversões PDF", 
  //   url: "/conversions", 
  //   icon: FileText,
  //   description: "Gerencie suas conversões"
  // },
//   { 
//     title: "Meus Tickets", 
//     url: "/tickets", 
//     icon: MessageSquare,
//     description: "Suporte e atendimento",
//     hasNotification: true
//   },
  { 
    title: "Analytics", 
    url: "/analytics", 
    icon: BarChart3,
    description: "Relatórios e métricas"
  },
]

const settingsItems = [
  { 
    title: "Configurações", 
    url: "/settings", 
    icon: Settings,
    description: "Preferências do sistema"
  },
  { 
    title: "Perfil", 
    url: "/profile", 
    icon: User,
    description: "Seus dados pessoais"
  },
  { 
    title: "Ajuda", 
    url: "/help", 
    icon: HelpCircle,
    description: "Central de ajuda"
  },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const { tickets } = useTickets()
  const currentPath = location.pathname
  
  const isCollapsed = false
  const openTicketsCount = tickets.filter(ticket => ticket.status === 'aberto').length

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/"
    return currentPath.startsWith(path)
  }

  const getNavClassName = (path: string) => {
    const active = isActive(path)
    return `
      group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
      ${active 
        ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-l-2 border-primary shadow-sm' 
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      }
      ${isCollapsed ? 'justify-center px-2' : ''}
    `
  }

  const renderNavItem = (item: typeof mainNavItems[0]) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild className="p-0 h-auto">
        <NavLink 
          to={item.url} 
          className={getNavClassName(item.url)}
          title={isCollapsed ? item.title : undefined}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`
              flex items-center justify-center rounded-md transition-colors duration-200
              ${isActive(item.url) 
                ? 'text-primary' 
                : 'text-muted-foreground group-hover:text-foreground'
              }
            `}>
              <item.icon className="h-5 w-5" />
            </div>
            
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate">{item.title}</span>
                  {/* {item.hasNotification && openTicketsCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="h-5 px-1.5 text-xs animate-pulse"
                    >
                      {openTicketsCount}
                    </Badge>
                  )} */}
                </div>
                <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                  {item.description}
                </p>
              </div>
            )}
          </div>
          
          {!isCollapsed && isActive(item.url) && (
            <ChevronRight className="h-4 w-4 text-primary/60" />
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )

  return (
    <Sidebar 
      className={`
        border-r bg-gradient-to-b from-background to-muted/20 backdrop-blur-sm
        ${isCollapsed ? 'w-16' : 'w-72'}
        transition-all duration-300 ease-in-out
      `}
      collapsible="icon"
    >
      <SidebarHeader className={`p-4 border-b ${isCollapsed ? 'px-2' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Alivya
              </h2>
              {/* <p className="text-xs text-muted-foreground">Sistema PDF Pro</p> */}
            </div>
          )}
        </div>
        <SidebarTrigger className="ml-auto mt-4 w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors" />
      </SidebarHeader>



      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={`
            px-3 mb-2 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider
            ${isCollapsed ? 'sr-only' : ''}
          `}>
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNavItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className={`
            px-3 mb-2 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider
            ${isCollapsed ? 'sr-only' : ''}
          `}>
            Sistema
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {settingsItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={`p-4 border-t ${isCollapsed ? 'px-2' : ''}`}>
        <div className={`
          flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-muted/50 to-muted/30 border
          ${isCollapsed ? 'justify-center' : ''}
        `}>
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-success to-success/80 rounded-full">
            <Shield className="h-4 w-4 text-success-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">Sistema Seguro</p>
              <p className="text-xs text-muted-foreground">Criptografia SSL/TLS</p>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}