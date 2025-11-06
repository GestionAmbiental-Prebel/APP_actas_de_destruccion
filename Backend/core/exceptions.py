# app/core/exceptions.py
from rest_framework.views import exception_handler
from rest_framework import status
from django.db import IntegrityError
from django.core.exceptions import ObjectDoesNotExist, ValidationError


# ==========================================================
# EXCEPCIONES PERSONALIZADAS
# ==========================================================

class RepositoryError(Exception):
    """Errores al interactuar con la base de datos."""
    pass

class ServiceError(Exception):
    """Errores de lógica de negocio en los servicios."""
    pass

class BusinessLogicError(ServiceError):
    """Errores de reglas de negocio, como dependencias o validaciones."""
    pass


# ==========================================================
# HANDLER GLOBAL DE EXCEPCIONES (para DRF)
# ==========================================================

def custom_exception_handler(exc, context):
    """
    Intercepta todas las excepciones y devuelve respuestas JSON uniformes.
    """
    # Llamar al handler base de DRF
    response = exception_handler(exc, context)

    # Si DRF ya lo manejó (por ejemplo ValidationError), lo adaptamos
    if response is not None:
        response.data = {
            "error": True,
            "message": response.data.get("detail", str(exc)),
            "code": response.status_code
        }
        return response

    # Si no lo manejó DRF, tratamos nuestras propias excepciones
    if isinstance(exc, BusinessLogicError):
        return _build_response(str(exc), status.HTTP_400_BAD_REQUEST)
    elif isinstance(exc, RepositoryError):
        return _build_response(f"Error en la base de datos: {exc}", status.HTTP_500_INTERNAL_SERVER_ERROR)
    elif isinstance(exc, ServiceError):
        return _build_response(f"Error en la lógica del servicio: {exc}", status.HTTP_500_INTERNAL_SERVER_ERROR)
    elif isinstance(exc, IntegrityError):
        return _build_response(f"Violación de integridad de datos: {exc}", status.HTTP_409_CONFLICT)
    elif isinstance(exc, ObjectDoesNotExist):
        return _build_response("El recurso solicitado no existe.", status.HTTP_404_NOT_FOUND)
    elif isinstance(exc, ValidationError):
        return _build_response(f"Error de validación: {exc}", status.HTTP_400_BAD_REQUEST)
    else:
        # Fallback para cualquier error inesperado
        return _build_response(f"Error interno del servidor: {exc}", status.HTTP_500_INTERNAL_SERVER_ERROR)


def _build_response(message, code):
    """Crea una respuesta JSON consistente."""
    from rest_framework.response import Response
    return Response({
        "error": True,
        "message": message,
        "code": code
    }, status=code)
