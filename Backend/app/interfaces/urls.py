from django.urls import path, include
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from app.interfaces.views import *

"""
Registrar aquí los endpoints de la API
Se recomienda usar un router para generar los endpoints automáticamente
"""

router = DefaultRouter()

# --- Catálogos ---

router.register(r'procedencias', ProcedenciaViewSet, basename='procedencia')
router.register(r'areas', AreaViewSet, basename='area')
router.register(r'categorias-residuos', CategoriaResiduoViewSet, basename='categoria-residuo')
router.register(r'residuos-especificos', ResiduoEspecificoViewSet, basename='residuo-especifico')
router.register(r'centros-costos', CentroCostoViewSet, basename='centro-costo')
router.register(r'roles-administrativos', RolAdministrativoViewSet, basename='rol-administrativo')

# --- Operaciones ---
router.register(r'operarios', OperarioViewSet, basename='operario')
router.register(r'actas', ActasViewSet, basename='acta')
router.register(r'actas-generacionresiduos', ActaGeneracionResiduoViewSet, basename='acta-generacion-residuo')
router.register(r'generaciones-residuos', GeneracionResiduoViewSet, basename='generacion-residuo')
router.register(r'subareas', SubAreaViewSet, basename='subarea')


urlpatterns = [
    path('api/', include(router.urls)),  # Prefijo para todas las rutas de API
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
