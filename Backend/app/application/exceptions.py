from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import traceback

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        # 🔥 Muestra el error real en consola
        print("=== EXCEPCIÓN NO MANEJADA ===")
        traceback.print_exc()

        return Response({
            'status_code': 500,
            'detail': 'Error interno del servidor'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response
