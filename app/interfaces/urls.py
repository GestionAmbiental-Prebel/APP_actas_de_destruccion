from django.urls import path, include
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from app.interfaces.views import (
    GerenciaViewSet,
    ProcedenciaViewSet,
    ActasViewSet,
    ActaGeneracionResiduoViewSet,
    UsuarioViewSet,
    GeneracionResiduoViewSet,
    AreaViewSet,
    CategoriaResiduoViewSet,)   
"""
    Registrar aqui los endpoints de la API
    Se recomienda usar un router para generar los endpoints automaticamente
"""

router = DefaultRouter()
router.register(r'gerencias', GerenciaViewSet, basename='gerencia')
router.register(r'procedencias', ProcedenciaViewSet, basename='procedencia')
router.register(r'actas', ActasViewSet, basename='acta')
router.register(r'acta-generacionresiduo', ActaGeneracionResiduoViewSet, basename='acta-generacionresiduo')
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'generacionresiduo', GeneracionResiduoViewSet, basename='generacionresiduo')
router.register(r'areas', AreaViewSet, basename='area')
router.register(r'categoriaresiduo', CategoriaResiduoViewSet, basename='categoriaresiduo')

urlpatterns = [
    path('api/', include(router.urls)),  # Prefijo para todas las rutas de API
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),  # URL más corta
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
]