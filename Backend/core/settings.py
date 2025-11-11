from pathlib import Path
import environ
import os

# ===============================
# BASE SETTINGS
# ===============================

BASE_DIR = Path(__file__).resolve().parent.parent

# Inicializar django-environ
env = environ.Env(
    DEBUG=(bool, False)  # Valor por defecto si no se encuentra en el .env
)

# Leer archivo .env
environ.Env.read_env(BASE_DIR / '.env')

# ===============================
# VARIABLES DE ENTORNO
# ===============================

SECRET_KEY = env('DJANGO_SECRET_KEY')
DEBUG = env('DJANGO_DEBUG')
DJANGO_ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS', default=['127.0.0.1', 'localhost'])

ALLOWED_HOSTS = DJANGO_ALLOWED_HOSTS

# ===============================
# APLICACIONES
# ===============================

DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

LOCAL_APPS = [
    'app',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'corsheaders',
    'drf_spectacular',
]

INSTALLED_APPS = DJANGO_APPS + LOCAL_APPS + THIRD_PARTY_APPS

# ===============================
# MIDDLEWARE
# ===============================

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',

    # 👇 Importante: CORS debe ir antes de CommonMiddleware
    'corsheaders.middleware.CorsMiddleware',

    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ===============================
# URLS / WSGI
# ===============================

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],  # Puedes agregar aquí rutas a carpetas de templates si las usas
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# ===============================
# BASE DE DATOS
# ===============================

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db_actas.db',
    }
}

# ===============================
# VALIDACIÓN DE CONTRASEÑAS
# ===============================

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ===============================
# INTERNACIONALIZACIÓN
# ===============================

LANGUAGE_CODE = 'es-co'
TIME_ZONE = 'America/Bogota'
USE_I18N = True
USE_TZ = True

# ===============================
# ARCHIVOS ESTÁTICOS
# ===============================

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# ===============================
# CONFIG. DEFAULTS
# ===============================

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ===============================
# CELERY (Tareas asíncronas)
# ===============================

CELERY_BROKER_URL = os.environ.get("CELERY_BROKER", 'redis://redis:6379/0')
CELERY_RESULT_BACKEND = os.environ.get("CELERY_BACKEND", 'redis://redis:6379/0')

# ===============================
# DJANGO REST FRAMEWORK
# ===============================

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',  # Swagger/OpenAPI
    'EXCEPTION_HANDLER': 'app.application.exceptions.custom_exception_handler',  
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',  # Solo JSON por defecto
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
        # JWT, descomenta la siguiente línea:
        # 'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

# ===============================
# CORS CONFIGURATION (🔥 Necesario para conectar el FRONT)
# ===============================

CORS_ALLOW_ALL_ORIGINS = True  # Permite todas las conexiones (solo para desarrollo)

# 💡 En producción usa mejor:
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:5173",
#     "http://127.0.0.1:5173",
# ]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

