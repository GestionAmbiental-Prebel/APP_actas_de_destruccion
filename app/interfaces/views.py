from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from drf_spectacular.utils import extend_schema, extend_schema_view

# Descomentar y agregar las importaciones necesarias
from app.application.services import (
    GerenciaService,
    ProcedenciaService,
    ActaService,
    ActaGeneracionResiduoService,
    UsuarioService,
    GeneracionResiduoService,
    ResiduoEspecificoService,
    CentroCostoService,
    RolAdministrativoService,
    OperarioService)

from app.infrastructure.repositories import (
    GerenciaRepositoryImpl,
    ProcedenciaRepositoryImpl,
    ActaRepositoryImpl,
    ActaGeneracionResiduoRepositoryImpl,
    UsuarioRepositoryImpl,
    GeneracionResiduoRepositoryImpl,
    AreaRepositoryImpl,
    ResiduoEspecificoRepositoryImpl,
    CentroCostoRepositoryImpl,
    RolAdministrativoRepositoryImpl,
    OperarioRepositoryImpl,)

from app.infrastructure.serializers import (
    GerenciaSerializer,
    ProcedenciaSerializer,
    ActaSerializer,
    ActaGeneracionResiduoSerializer,
    UsuarioSerializer,
    GeneracionResiduoSerializer,
    AreaSerializer,
    ResiduoEspecificoSerializer,
    CentroCostoSerializer,
    RolAdministrativoSerializer,
    OperarioSerializer,)

# Generic ViewSet Generator
def generate_viewset(service_cls, repository_cls, serializer_cls, tag_name, filterable_fields=None):
    """
    Genera un ViewSet genérico para manejar operaciones CRUD en un modelo específico.
    :param service_cls: Clase del servicio que maneja la lógica de negocio.
    :param repository_cls: Clase del repositorio que maneja la persistencia de datos.
    :param serializer_cls: Clase del serializador que maneja la validación y serialización de datos.
    :param tag_name: Nombre del modelo para la documentación de la API.
    :param filterable_fields: Lista de campos que se pueden filtrar en la consulta (QueryParams).
    """
    @extend_schema_view(
        list=extend_schema(summary=f"Listar {tag_name}"),
        retrieve=extend_schema(summary=f"Obtener un {tag_name} por ID"),
        create=extend_schema(summary=f"Crear un {tag_name}"),
        update=extend_schema(summary=f"Actualizar un {tag_name}"),
        partial_update=extend_schema(summary=f"Actualizar parcialmente un {tag_name}"),
        destroy=extend_schema(summary=f"Eliminar un {tag_name}")
    )
    class GenericViewSet(viewsets.ViewSet):
        permission_classes = [AllowAny]
        # permission_classes = [IsAuthenticated]
        service = service_cls(repository_cls())

        def list(self, request):
            filters = {}
            if filterable_fields:
                for field in filterable_fields:
                    if field in request.query_params:
                        filters[field] = request.query_params[field]

            print(f"Filters: {filters}")
            data = self.service.list_all(filters)
            serializer = serializer_cls(data, many=True)
            return Response(serializer.data)

        def retrieve(self, request, pk=None):
            item = self.service.get_by_id(int(pk))
            serializer = serializer_cls(item)
            return Response(serializer.data)

        def create(self, request):
            serializer = serializer_cls(data=request.data)
            serializer.is_valid(raise_exception=True)
            item = self.service.create(serializer.validated_data)
            return Response(serializer_cls(item).data, status=status.HTTP_201_CREATED)

        def update(self, request, pk=None):
            serializer = serializer_cls(data=request.data)
            serializer.is_valid(raise_exception=True)
            item = self.service.update(int(pk), serializer.validated_data)
            return Response(serializer_cls(item).data)

        def destroy(self, request, pk=None):
            self.service.delete(int(pk))
            return Response(status=status.HTTP_204_NO_CONTENT)

    return GenericViewSet

"""
    Aquí puedes definir tus ViewSets específicos para tu API
    Puedes usar la función generate_viewset o crear tus propios ViewSets
"""

# Ejemplo de uso de la función generate_viewset para crear ViewSets específicos
GerenciaViewSet = generate_viewset(
    GerenciaService,
    GerenciaRepositoryImpl,
    GerenciaSerializer,
    "Gerencia",
    filterable_fields=["estado"]
)

ProcedenciaViewSet = generate_viewset(
    ProcedenciaService,
    ProcedenciaRepositoryImpl,
    ProcedenciaSerializer,
    "Procedencia",
    filterable_fields=["sede", "nombre"]
)

ActasViewSet = generate_viewset(
    ActaService,
    ActaRepositoryImpl,
    ActaSerializer,
    "Acta",
    filterable_fields=["numero_acta", "area_id", "centro_costo_id", "operario_entrega_id", "operario_recepcion_id"]
)

ActaGeneracionResiduoViewSet = generate_viewset(
    ActaGeneracionResiduoService,
    ActaGeneracionResiduoRepositoryImpl,
    ActaGeneracionResiduoSerializer,
    "ActaGeneracionresiduo",
    filterable_fields=["acta_id", "generacion_residuo_id", "peso_reportado", "peso_conciliado"]
)

UsuarioViewSet = generate_viewset(
    UsuarioService,
    UsuarioRepositoryImpl,
    UsuarioSerializer,
    "Usuario",
    filterable_fields=["usernameA", "area_id", "rol_administrativo_id"]
)

GeneracionResiduoViewSet = generate_viewset(
    GeneracionResiduoService,
    GeneracionResiduoRepositoryImpl,
    GeneracionResiduoSerializer,
    "Generacionresiduo",
    filterable_fields=["fecha", "residuo_id", "operario_id"]
)

AreaViewSet = generate_viewset(
    ActaGeneracionResiduoService,
    AreaRepositoryImpl,
    AreaSerializer,
  
    "Area",
    filterable_fields=["nombre", "procedencia_id"]
)

CategoriaResiduoViewSet = generate_viewset(
    ActaGeneracionResiduoService,
    AreaRepositoryImpl,
    AreaSerializer,
  
    "CategoriaResiduo",
    filterable_fields=["nombre", "descripcion"]
)

ResiduoEspecificoViewSet = generate_viewset(
    ResiduoEspecificoService,
    ResiduoEspecificoRepositoryImpl,
    ResiduoEspecificoSerializer,
  
    "Residuoespecifico",
    filterable_fields=["nombre","categoria_residuo_id"]
)

CentroCostoViewSet = generate_viewset(
    CentroCostoService,
    CentroCostoRepositoryImpl,
    CentroCostoSerializer,
  
    "Centrocosto",
    filterable_fields=["codigo","area_id"]
)

RolAdministrativoViewSet = generate_viewset(
    RolAdministrativoService,
    RolAdministrativoRepositoryImpl,
    RolAdministrativoSerializer,
  
    "Roladministrativo",
    filterable_fields=["nombre"]
)

OperarioViewSet = generate_viewset(
    OperarioService,
    OperarioRepositoryImpl,
    OperarioSerializer,
    "Operario",
    filterable_fields=["nombre", "apellido", "documento", "area_id"]
)