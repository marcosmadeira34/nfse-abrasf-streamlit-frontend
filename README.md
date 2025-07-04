# ❤️ LoveNFSE - Sistema de Automação para Notas Fiscais de Serviço

> A ferramenta que te faz amar até as notas fiscais da prefeitura!

Sistema completo para automatizar a extração inteligente de dados de NFS-e em PDF utilizando IA e integração direta com sistemas fiscais via API.

## 🚀 Principais Funcionalidades

- 🔐 **Autenticação Segura**: Login tradicional + Google OAuth 2.0
- 📄 **Upload de PDFs**: Interface drag-and-drop para múltiplos arquivos
- 🤖 **IA Avançada**: Extração inteligente de dados usando Google Document AI
- 📊 **Dashboard Completo**: Acompanhamento em tempo real do processamento
- 📦 **Download Organizado**: XMLs individuais ou ZIP completo
- 🔄 **Processamento Assíncrono**: Backend Django + Celery para alta performance
- 📱 **Interface Moderna**: Design responsivo e intuitivo

## 🔧 Instalação e Configuração

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/nfse-abrasf-streamlit-frontend.git
cd nfse-abrasf-streamlit-frontend
```

### 2. Instale as Dependências

```bash
pip install -r requirements.txt
```

### 3. Configure as Variáveis de Ambiente

```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

**Variáveis Obrigatórias:**

```env
DJANGO_BACKEND_URL=http://127.0.0.1:8001
```

**Para Google OAuth (Opcional):**

```env
GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=sua_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8501
```

### 4. Execute a Aplicação

```bash
streamlit run extract/dashboard.py
```

## 🔐 Configuração do Google OAuth

Para habilitar o login com Google, siga o guia completo: [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)

**Resumo rápido:**

1. Crie um projeto no [Google Cloud Console](https://console.cloud.google.com/)
2. Configure OAuth 2.0 Client ID
3. Adicione URLs autorizadas
4. Configure as variáveis de ambiente

## 🏗️ Arquitetura do Sistema

```
Frontend (Streamlit)
├── 🔐 Sistema de Autenticação
├── 📤 Upload de Arquivos
├── 🔄 Monitoramento de Tarefas
└── 📊 Dashboard e Relatórios

Backend (Django + Celery)
├── 🛡️ Autenticação JWT + OAuth
├── 🤖 Processamento com Document AI
├── 📋 Fila de Tarefas Assíncronas
└── 🗃️ Armazenamento Seguro
```

## 📋 Fluxo de Uso

### 1. **Autenticação**

- Login tradicional (usuário/senha)
- Login com Google (OAuth 2.0)

### 2. **Upload de PDFs**

- Drag & drop ou seleção manual
- Suporte a múltiplos arquivos
- Validação automática de formato

### 3. **Processamento**

- Envio para backend Django
- Processamento assíncrono com Celery
- Extração de dados via Document AI
- Geração automática de XMLs

### 4. **Acompanhamento**

- Status em tempo real
- Barra de progresso
- Logs detalhados de processamento

### 5. **Download**

- XMLs individuais
- Pacote ZIP completo
- Histórico de processamentos

## 🛡️ Segurança

- ✅ **OAuth 2.0 + PKCE**: Autenticação segura com Google
- ✅ **JWT Tokens**: Autenticação stateless com expiração
- ✅ **CSRF Protection**: State parameter para OAuth
- ✅ **HTTPS Ready**: Pronto para produção segura
- ✅ **Token Refresh**: Renovação automática de sessão

## 🔧 Desenvolvimento

### Estrutura de Arquivos

```
extract/
├── dashboard.py          # Interface principal Streamlit
├── streamlit_auth.py     # Sistema de autenticação
└── services.py          # Serviços auxiliares (futuro)

data/
├── uploads/             # PDFs enviados
└── xmls/               # XMLs gerados

.env.example            # Exemplo de configuração
requirements.txt        # Dependências Python
```

### Variáveis de Ambiente

| Variável               | Descrição                 | Obrigatória |
| ---------------------- | ------------------------- | ----------- |
| `DJANGO_BACKEND_URL`   | URL do backend Django     | ✅          |
| `GOOGLE_CLIENT_ID`     | Client ID do Google OAuth | ❌          |
| `GOOGLE_CLIENT_SECRET` | Secret do Google OAuth    | ❌          |
| `GOOGLE_REDIRECT_URI`  | URI de redirecionamento   | ❌          |

## 🐛 Troubleshooting

### Erro de Conexão com Backend

```bash
# Verifique se o Django está rodando
curl http://127.0.0.1:8001/health/

# Verifique a variável de ambiente
echo $DJANGO_BACKEND_URL
```

### Problemas com Google OAuth

- Verifique se as URLs estão configuradas no Google Cloud Console
- Confirme se as APIs estão ativadas
- Consulte o [guia completo](GOOGLE_OAUTH_SETUP.md)

### Erro de Upload

- Verifique se o diretório `data/uploads/` existe
- Confirme se há espaço em disco suficiente
- Verifique as permissões de escrita

## 📚 Dependências Principais

- **Streamlit**: Interface web moderna
- **Requests**: Comunicação HTTP com backend
- **Pandas**: Manipulação de dados
- **Google Cloud Document AI**: IA para extração de dados

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

- **Documentação**: Consulte os arquivos `.md` no repositório
- **Issues**: Abra uma issue no GitHub
- **Email**: Entre em contato com o desenvolvedor

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

---

## 🎯 Roadmap

- [ ] Integração com mais provedores OAuth (Microsoft, Facebook)
- [ ] API REST para integração externa
- [ ] Dashboard administrativo
- [ ] Relatórios avançados com gráficos
- [ ] Processamento de outros formatos (Word, Excel)
- [ ] App mobile (React Native)

---

❤️ **Feito com amor para facilitar sua vida fiscal!**
