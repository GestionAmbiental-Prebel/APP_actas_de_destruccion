from rest_framework.permissions import BasePermission
import os

# Initialize environment variables
import environ
env = environ.Env()
environ.Env.read_env()

class TokenRequiredForWrite(BasePermission):
    """
    Permiso personalizado que permite GET sin restricciones,
    pero requiere un token en el encabezado Authorization para POST, PUT y DELETE.
    """

    def has_permission(self, request, view):
        """
        Este método se ejecuta en cada solicitud a un ViewSet para verificar si el usuario tiene permiso.
        """
        if request.method in ['GET']:
            return True

        # Para POST, PUT y DELETE se requiere un token en el encabezado
        token_valido = os.getenv("API_SECRET_TOKEN")
        auth_header = request.headers.get("Authorization")

        return auth_header == f"Bearer {token_valido}"
