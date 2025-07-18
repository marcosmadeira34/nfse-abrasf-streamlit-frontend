import streamlit as st
import requests
import json
from typing import Optional, Dict, Any
import os
import time
from streamlit_cookies_manager import EncryptedCookieManager
from datetime import datetime


# Configurações do backend Django
DJANGO_BACKEND_URL = os.getenv("DJANGO_BACKEND_URL", "http://127.0.0.1:8001")

# Configura tempo de expiração do login (em segundos)
LOGIN_EXPIRATION_SECONDS = 1800 # 1/5 hora


# Inicializa o gerenciador de cookies (a senha deve ser secreta e complexa)
cookies = EncryptedCookieManager(prefix="myapp_", password="uma_senha_bem_complexa_123")
if not cookies.ready():
    st.stop()




# --- CSS Customizado com Identidade Visual LoveNFSE ---
def load_custom_css():
    st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

    :root {
        --pure-white: #FFFFFF;
        --soft-light-gray: #ECEFF4;
        --medium-gray: #7B8A99;
        --main-blue: #274C77;
        --accent-blue: #A3CEF1;
        --highlight-gold: #E6B800;
        --patrimonium-color: #1A3375;
        --patrimonium-green: #00FCA8;
        --patrimonium-card: #edfcf1
        --dark-blue: #1A3375;
    }

    body, [data-testid="stAppViewContainer"] {
        background-color: var(--soft-light-gray) !important;
        font-family: 'Poppins', sans-serif;
        color: var(--medium-gray);
    }

    .main-header {
        background-color: var(--patrimonium-color);
        padding: 2rem;
        border-radius: 12px;
        margin-bottom: 2rem;
        box-shadow: 0 6px 16px rgba(39, 76, 119, 0.4);
        text-align: center;
        color: var(--pure-white);
    }

    .main-header h1 {
        font-weight: 700;
        font-size: 3rem;
        margin: 0;
    }

    .main-header .subtitle {
        font-size: 1.1rem;
        color: var(--pure-white);
    }

    h1, h2, h3 {
        color: var(--main-blue);
    }

    h1 { font-size: 2.5rem; }
    h2 { font-size: 1.8rem; }
    h3 { font-size: 1.4rem; }

    .stButton button {
    background-color: var(--patrimonium-color);
    color: var(--pure-white);
    border: none;
    border-radius: 25px;
    font-weight: 600;
    padding: 0.75rem 2rem;
    box-shadow: 0 3px 8px rgba(39, 76, 119, 0.6);
    transition: all 0.3s ease;
}

    .stButton button:hover {
        background-color: var(--patrimonium-green);
        color: var(--dark-blue);
        transform: translateY(-2px);
    }

    .stButton button:active,
    .stButton button:focus {
        background-color: var(--patrimonium-green);
        color: var(--pure-white);
    }
                

    .stTabs [data-baseweb="tab-list"] {
    background-color: var(--soft-light-gray);
    border-radius: 10px;
    padding: 0.5rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    margin-bottom: 1rem;
    }

    .stTabs [data-baseweb="tab"] {
        background-color: var(--accent-blue);
        border-radius: 8px;
        font-weight: 600;
        color: var(--main-blue);
        padding: 0.75rem 2rem;  /* Aqui está o segredo: padding lateral maior */
        min-width: 150px;  /* Opcional: garante que o botão não fique estreito demais */
        text-align: center;  /* Centraliza o texto, opcional */
    }

    .stTabs [data-baseweb="tab"]:hover {
        background-color: var(--main-blue);
        color: var(--pure-white);
    }

    .stTabs [aria-selected="true"] {
        background-color: var(--main-blue);
        color: var(--patrimonium-green);
    }

    .metric-card {
        background-color: var(--patrimonium-card);
        border-left: 4px solid var(--main-blue);
        padding: 1.5rem;
        border-radius: 15px;
        box-shadow: 0 4px 12px rgba(44, 62, 80, 0.1);
        transition: all 0.3s ease;
        margin-bottom: 3rem;
    }

    .metric-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(163, 206, 241, 0.3);
    }

    .css-1d391kg {
        background-color: var(--soft-light-gray);
    }

    .stFileUploader > div > div {
        background-color: var(--pure-white);
        border: 2px dashed var(--main-blue);
        border-radius: 15px;
        padding: 2rem;
    }

    .stProgress .st-bo {
        background-color: var(--main-blue);
    }

    .streamlit-expanderHeader {
        background-color: var(--soft-light-gray);
        border-radius: 10px;
        font-weight: 600;
        color: var(--main-blue);
    }

    @media (max-width: 768px) {
        .main-header h1 { font-size: 2rem; }
    }
    </style>
    """, unsafe_allow_html=True)


load_custom_css()


# Classe de gerenciamento de autenticação
class StreamlitAuthManager:
    """Gerenciador de autenticação para Streamlit"""

    @staticmethod
    def login(username: str, password: str) -> tuple[bool, str]:
        """Realiza login no backend Django"""
        try:
            response = requests.post(
                f"{DJANGO_BACKEND_URL}/auth/login/",
                json={'username': username, 'password': password},
                timeout=30
            )
            if response.status_code == 200:
                data = response.json()

                # Armazena tokens e infos na sessão
                st.session_state.authenticated = True
                st.session_state.access_token = data['tokens']['access_token']
                st.session_state.refresh_token = data['tokens']['refresh_token']
                st.session_state.user_info = data['user']

                # Armazena também nos cookies
                cookies["access_token"] = data['tokens']['access_token']
                cookies["refresh_token"] = data['tokens']['refresh_token']
                cookies["user_info"] = json.dumps(data['user'])
                cookies["login_time"] = str(datetime.utcnow().timestamp())  # Marca o horário de login
                cookies.save()

                return True, "Login realizado com sucesso!"
            elif response.status_code == 401:
                return False, response.json().get('error', 'Credenciais inválidas')
            else:
                return False, f"Erro no servidor: {response.status_code}"
        except requests.RequestException as e:
            return False, f"Erro de conexão: {str(e)}"
        except Exception as e:
            return False, f"Erro inesperado: {str(e)}"

    @staticmethod
    def logout():
        """Realiza logout completo"""
        try:
            if st.session_state.get('access_token'):
                requests.post(
                    f"{DJANGO_BACKEND_URL}/auth/logout/",
                    headers={'Authorization': f"Bearer {st.session_state.access_token}"},
                    timeout=10
                )
        except:
            pass  # Ignora erros no backend

        # Limpa sessão e cookies
        clear_authentication()
        cookies["access_token"] = ""
        cookies["refresh_token"] = ""
        cookies["user_info"] = ""
        cookies["login_time"] = ""
        cookies.save()

    @staticmethod
    def verify_token() -> bool:
        """Verifica se o token atual é válido"""
        if not st.session_state.get('access_token'):
            return False
        try:
            response = requests.post(
                f"{DJANGO_BACKEND_URL}/auth/verify/",
                headers={'Authorization': f"Bearer {st.session_state.access_token}"},
                timeout=10
            )
            return response.status_code == 200
        except:
            return False

    @staticmethod
    def refresh_token() -> bool:
        """Renova o access token usando o refresh token"""
        if not st.session_state.get('refresh_token'):
            return False
        try:
            response = requests.post(
                f"{DJANGO_BACKEND_URL}/auth/refresh/",
                json={'refresh_token': st.session_state.refresh_token},
                timeout=30
            )
            if response.status_code == 200:
                data = response.json()
                st.session_state.access_token = data['tokens']['access_token']

                # Atualiza cookie
                cookies["access_token"] = data['tokens']['access_token']
                cookies.save()
                return True
            return False
        except:
            return False

    @staticmethod
    def ensure_authenticated() -> bool:
        """Garante que o usuário está autenticado"""
        if not st.session_state.get('authenticated'):
            return False
        if StreamlitAuthManager.verify_token():
            return True
        if StreamlitAuthManager.refresh_token():
            return True
        StreamlitAuthManager.logout()
        return False

    @staticmethod
    def get_auth_headers() -> Dict[str, str]:
        """Headers de autenticação"""
        if st.session_state.get('access_token'):
            return {'Authorization': f"Bearer {st.session_state.access_token}"}
        return {}

    @staticmethod
    def authenticated_request(method: str, endpoint: str, **kwargs) -> Optional[requests.Response]:
        """Faz uma requisição autenticada"""
        if not StreamlitAuthManager.ensure_authenticated():
            st.error("Sessão expirada. Faça login novamente.")
            return None
        headers = kwargs.get('headers', {})
        headers.update(StreamlitAuthManager.get_auth_headers())
        kwargs['headers'] = headers
        try:
            url = f"{DJANGO_BACKEND_URL}{endpoint}"
            return getattr(requests, method.lower())(url, **kwargs)
        except Exception as e:
            st.error(f"Erro na requisição: {str(e)}")
            return None

    
def show_login_page():
    """
    Exibe a página de login com identidade visual
    """
    # CSS específico para login
    st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&family=Lato:wght@300;400;700&display=swap');
    
    .login-container {
        max-width: 400px;
        margin: 0 auto;
        padding: 2rem;
        background: linear-gradient(135deg, #ffffff, #F1FAEE);
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(29, 53, 87, 0.1);
        text-align: center;
        margin-top: 5rem;
    }
    
    .login-header {
        margin-bottom: 2rem;
    }
    
    .login-mascot {
        font-size: 5rem;
        animation: pulse 2s infinite;
        margin-bottom: 1rem;
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }
    
    .login-title {
        font-family: 'Poppins', sans-serif;
        font-weight: 700;
        font-size: 2.5rem;
        color: #1D3557;
        margin: 0;
        background: var(--patrimonium-color);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
                text-align: center;
        margin-top: 0.5rem;
                animation: fadeIn 1s ease-in-out;
    }
    
    .login-subtitle {
        font-family: 'Lato', sans-serif;
        color: #457B9D;
        font-size: 1.1rem;
        margin-top: 0.5rem;
    }
    
    .login-form {
        margin-top: 2rem;
    }
    
    .stTextInput > div > div > input {
        border-radius: 15px !important;
        border: 2px solid #F1FAEE !important;
        font-family: 'Lato', sans-serif !important;
        padding: 1rem !important;
        font-size: 1rem !important;
        transition: all 0.3s ease !important;
    }
    
    .stTextInput > div > div > input:focus {
        border-color: #E63946 !important;
        box-shadow: 0 0 15px rgba(230, 57, 70, 0.2) !important;
    }
    
    .login-button {
        background: linear-gradient(45deg, #E63946, #ff4757) !important;
        color: white !important;
        border: none !important;
        border-radius: 25px !important;
        font-family: 'Poppins', sans-serif !important;
        font-weight: 600 !important;
        padding: 0.75rem 3rem !important;
        font-size: 1.1rem !important;
        margin-top: 1rem !important;
        transition: all 0.3s ease !important;
        box-shadow: 0 6px 20px rgba(230, 57, 70, 0.3) !important;
        width: 100% !important;
    }
    
    .login-button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 25px rgba(230, 57, 70, 0.4) !important;
    }
    
    .login-footer {
        margin-top: 2rem;
        font-family: 'Lato', sans-serif;
        color: #457B9D;
        font-size: 0.9rem;
    }
    
    .demo-info {
        background: linear-gradient(135deg, #F1FAEE, white);
        padding: 1.5rem;
        border-radius: 15px;
        margin-top: 2rem;
        border: 1px solid rgba(230, 57, 70, 0.1);
    }
    
    .demo-info h4 {
        color: #1D3557;
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
        margin-bottom: 1rem;
    }
    
    .demo-credentials {
        background: white;
        padding: 1rem;
        border-radius: 10px;
        border-left: 4px solid #E63946;
        margin: 0.5rem 0;
        font-family: 'Lato', sans-serif;
        color: #1D3557;
        font-size: 0.9rem;
    }
    </style>
    """, unsafe_allow_html=True)
    
    # Container principal de login
    st.markdown("""
    <div class="" style="margin-top: -100px;">
        <h1 class="login-title">Conversor NFSE em XML Abrasf 1.0</h1>
    </div>
    """, unsafe_allow_html=True)
    
    # Formulário de login centralizado
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        with st.form("login_form", clear_on_submit=False):
            st.markdown("""
                    <div class="fade-in" style="opacity: 1 !important; filter: none !important;">
                        <h2 style="font-weight: 700; color: var(--main-blue);">
                            <span class="icon">🔑</span> <strong>Autenticação de usuários</strong>
                        </h2>
                    </div>
                    """, unsafe_allow_html=True)
            
            username = st.text_input(
                "👤 Usuário:",
                placeholder="Digite seu usuário",
                key="login_username"
            )
            
            password = st.text_input(
                "🔑 Senha:",
                type="password",
                placeholder="Digite sua senha",
                key="login_password"
            )
            
            submitted = st.form_submit_button(
                "🚀 ENTRAR NO SISTEMA",
                use_container_width=True
            )
            
            if submitted:
                if username and password:
                    with st.spinner("🔍 Verificando credenciais..."):
                        success, message = StreamlitAuthManager.login(username, password)
                    
                    if success:
                        st.success(f"✅ {message}")
                        #st.balloons()
                        time.sleep(1)
                        st.rerun()
                    else:
                        st.error(f"❌ {message}")
                else:
                    st.warning("⚠️ Por favor, preencha usuário e senha.")
        
        # Informações de demonstração
        # st.markdown("""
        # <div class="demo-info">
        #     <h4>🎯 Demonstração</h4>
        #     <div class="demo-credentials">
        #         <strong>Usuário:</strong> admin<br>
        #         <strong>Senha:</strong> sua_senha_admin
        #     </div>
        #     <div style="font-size: 0.8rem; color: #457B9D; margin-top: 1rem;">
        #         💡 Use as credenciais acima para testar o sistema
        #     </div>
        # </div>
        # """, unsafe_allow_html=True)
    
    # Footer da página de login
    st.markdown("""
    <div style="text-align: center; margin-top: 3rem; color: #457B9D; font-family: 'Lato', sans-serif;">
        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;"></div>
        <div>Transformando processos em experiências incríveis</div>
        <div style="font-size: 0.8rem; margin-top: 0.5rem; opacity: 0.7;">
            © 2025 3MX Consultoria de T.I • Feito com amor e tecnologia
        </div>
    </div>
    """, unsafe_allow_html=True)


def show_user_info():
    """Exibe informações do usuário logado"""
    user_info = st.session_state.get('user_info', {})
    
    with st.sidebar:
        st.markdown("---")
        st.markdown("👤 **Usuário Logado**")
        st.markdown(f"**Nome:** {user_info.get('username', 'N/A')}")
        if user_info.get('first_name') or user_info.get('last_name'):
            st.markdown(f"**Nome Completo:** {user_info.get('first_name', '')} {user_info.get('last_name', '')}")
        st.markdown(f"**Email:** {user_info.get('email', 'N/A')}")
        
        if user_info.get('is_staff'):
            st.markdown("🛡️ **Administrador**")
        
        if st.button("🚪 Sair", use_container_width=True):
            StreamlitAuthManager.logout()
            st.rerun()


def require_auth(func):
    """
    Decorator para páginas que requerem autenticação
    """
    def wrapper(*args, **kwargs):
        StreamlitAuthManager.initialize_session_state()
        
        if not StreamlitAuthManager.ensure_authenticated():
            show_login_page()
            return
        
        show_user_info()
        return func(*args, **kwargs)
    
    return wrapper


def load_auth_from_cookies():
    """Carrega autenticação a partir dos cookies"""
    access_token = cookies.get("access_token")
    refresh_token = cookies.get("refresh_token")
    user_info_str = cookies.get("user_info")
    login_timestamp = cookies.get("login_time")

    if not (access_token and refresh_token and user_info_str and login_timestamp):
        clear_authentication()
        return

    # Verifica expiração
    try:
        elapsed = datetime.utcnow().timestamp() - float(login_timestamp)
        if elapsed > LOGIN_EXPIRATION_SECONDS:
            StreamlitAuthManager.logout()  # Expirou, forçar logout
            return
    except (ValueError, TypeError):
        StreamlitAuthManager.logout()
        return

    # Login válido
    st.session_state.authenticated = True
    st.session_state.access_token = access_token
    st.session_state.refresh_token = refresh_token
    try:
        st.session_state.user_info = json.loads(user_info_str)
    except json.JSONDecodeError:
        st.session_state.user_info = None


def clear_authentication():
    """Limpa a autenticação da sessão"""
    st.session_state.authenticated = False
    st.session_state.access_token = None
    st.session_state.refresh_token = None
    st.session_state.user_info = None

if "authenticated" not in st.session_state:
    load_auth_from_cookies()


