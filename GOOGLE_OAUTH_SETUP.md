# 🔐 Configuração do Google OAuth 2.0

Este guia mostra como configurar a autenticação com Google para o LoveNFSE.

## 📋 Pré-requisitos

1. Conta Google
2. Acesso ao Google Cloud Console
3. Projeto Django configurado com endpoint `/auth/google-login/`

## 🚀 Passo a Passo

### 1. Criar Projeto no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API do Google+ (Google People API)

### 2. Configurar OAuth 2.0

1. Vá para **APIs & Services** → **Credentials**
2. Clique em **Create Credentials** → **OAuth 2.0 Client IDs**
3. Escolha **Web application**
4. Configure:
   - **Name**: LoveNFSE
   - **Authorized JavaScript origins**:
     - `http://localhost:8501` (desenvolvimento)
     - `https://seu-dominio.com` (produção)
   - **Authorized redirect URIs**:
     - `http://localhost:8501` (desenvolvimento)
     - `https://seu-dominio.com` (produção)

### 3. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
# Configurações do Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-sua_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:8501
```

### 4. Endpoint no Backend Django

Crie o endpoint `/auth/google-login/` no seu Django que deve:

```python
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
import requests

@api_view(['POST'])
def google_login(request):
    try:
        google_token = request.data.get('google_token')
        user_info = request.data.get('user_info')

        # Verifica se o token do Google é válido
        google_response = requests.get(
            f'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f'Bearer {google_token}'}
        )

        if google_response.status_code != 200:
            return Response({'error': 'Token do Google inválido'},
                          status=status.HTTP_400_BAD_REQUEST)

        # Cria ou atualiza o usuário
        email = user_info.get('email')
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'first_name': user_info.get('given_name', ''),
                'last_name': user_info.get('family_name', ''),
                'is_active': True
            }
        )

        # Gera tokens JWT
        refresh = RefreshToken.for_user(user)

        return Response({
            'tokens': {
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh)
            },
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user_info.get('name'),
                'picture': user_info.get('picture'),
                'provider': 'google',
                'locale': user_info.get('locale')
            }
        })

    except Exception as e:
        return Response({'error': str(e)},
                      status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

## 🛡️ Segurança

- ✅ PKCE (Proof Key for Code Exchange) implementado
- ✅ State parameter para prevenir CSRF
- ✅ Tokens JWT com expiração
- ✅ Verificação de token no backend
- ✅ Limpeza automática de dados OAuth

## 🔧 Desenvolvimento vs Produção

### Desenvolvimento

```
GOOGLE_REDIRECT_URI=http://localhost:8501
```

### Produção

```
GOOGLE_REDIRECT_URI=https://seu-dominio.com
```

**Importante**: Sempre configure as URLs autorizadas no Google Cloud Console para cada ambiente!

## 🐛 Troubleshooting

### Erro: "redirect_uri_mismatch"

- Verifique se a URL está configurada no Google Cloud Console
- Certifique-se de que não há barra no final da URL

### Erro: "invalid_client"

- Verifique GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET
- Confirme se as APIs estão ativadas no Google Cloud

### Erro: "access_denied"

- Usuário cancelou o login
- Verifique se o aplicativo não está bloqueado

## 📱 Tela de Consentimento

Configure a tela de consentimento em **OAuth consent screen**:

- **User Type**: External (para uso público)
- **App name**: LoveNFSE
- **User support email**: seu-email@exemplo.com
- **Scopes**: `email`, `profile`, `openid`

## 🎯 Fluxo de Autenticação

1. Usuário clica em "Entrar com Google"
2. Redirecionamento para Google OAuth
3. Usuário autoriza o aplicativo
4. Google redireciona com código de autorização
5. Streamlit troca código por tokens
6. Obtém informações do usuário do Google
7. Envia dados para backend Django
8. Django valida e cria/atualiza usuário
9. Retorna tokens JWT para Streamlit
10. Usuário logado com sucesso!
