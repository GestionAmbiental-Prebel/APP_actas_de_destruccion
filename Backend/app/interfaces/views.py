from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.decorators import action


from app.application.services import (
    SedeService,
    ProcedenciaService,
    ActaService,
    ActaGeneracionResiduoService,
    GeneracionResiduoService,
    AreaService,
    CategoriaResiduoService,
    ResiduoEspecificoService,
    CentroCostoService,
    RolAdministrativoService,
    OperarioService,
    SubAreaService,
    NovedadConciliacionService,
    ConciliacionService,
)

from app.infrastructure.repositories import (
    SedeRepositoryImpl,
    ProcedenciaRepositoryImpl,
    ActaRepositoryImpl,
    ActaGeneracionResiduoRepositoryImpl,
    GeneracionResiduoRepositoryImpl,
    AreaRepositoryImpl,
    CategoriaResiduoRepositoryImpl,
    ResiduoEspecificoRepositoryImpl,
    CentroCostoRepositoryImpl,
    RolAdministrativoRepositoryImpl,
    OperarioRepositoryImpl,
    SubAreaRepositoryImpl,
    NovedadConciliacionRepositoryImpl,
)

from app.infrastructure.serializers import (
    SedeSerializer,
    ProcedenciaSerializer,
    ActaSerializer,
    ActaGeneracionResiduoSerializer,
    GeneracionResiduoSerializer,
    AreaSerializer,
    CategoriaResiduoSerializer,
    ResiduoEspecificoSerializer,
    CentroCostoSerializer,
    RolAdministrativoSerializer,
    OperarioSerializer,
    SubAreaSerializer,
    NovedadConciliacionSerializer,
    ConciliacionSerializer,
)


# ====================================================
# GENERADOR GENÉRICO DE VIEWSETS
# ====================================================

def generate_viewset(service_cls, repository_cls, serializer_cls, tag_name):
    """
    Genera un ViewSet genérico para operaciones CRUD.
    service_cls: Clase de servicio (lógica de negocio)
    repository_cls: Clase del repositorio (acceso a datos)
    serializer_cls: Clase del serializador (validación)
    tag_name: Nombre descriptivo para Swagger
    """

    @extend_schema_view(
        list=extend_schema(summary=f"Listar {tag_name}"),
        retrieve=extend_schema(summary=f"Obtener {tag_name} por ID"),
        create=extend_schema(summary=f"Crear un {tag_name}"),
        update=extend_schema(summary=f"Actualizar un {tag_name}"),
        destroy=extend_schema(summary=f"Eliminar un {tag_name}")
    )
    class GenericViewSet(viewsets.ViewSet):
        permission_classes = [AllowAny]
        service = service_cls(repository_cls())

        def list(self, request):
            """GET /api/<modelo>/"""
            data = self.service.list_all()
            serializer = serializer_cls(data, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        def retrieve(self, request, pk=None):
            """GET /api/<modelo>/{id}/"""
            item = self.service.get_by_id(int(pk))
            if not item:
                return Response({"detail": f"{tag_name} no encontrado."}, status=status.HTTP_404_NOT_FOUND)
            serializer = serializer_cls(item)
            return Response(serializer.data, status=status.HTTP_200_OK)

        def create(self, request):
            """POST /api/<modelo>/"""
            serializer = serializer_cls(data=request.data)
            serializer.is_valid(raise_exception=True)
            created = self.service.create(serializer.validated_data)
            return Response(serializer_cls(created).data, status=status.HTTP_201_CREATED)

        def update(self, request, pk=None):
            """PUT /api/<modelo>/{id}/"""
            serializer = serializer_cls(data=request.data)
            serializer.is_valid(raise_exception=True)
            updated = self.service.update(int(pk), serializer.validated_data)
            return Response(serializer_cls(updated).data, status=status.HTTP_200_OK)

        def destroy(self, request, pk=None):
            """DELETE /api/<modelo>/{id}/"""
            self.service.delete(int(pk))
            return Response(status=status.HTTP_204_NO_CONTENT)

    return GenericViewSet


# ====================================================
# REGISTRO DE VIEWSETS ESPECÍFICOS
# ====================================================

SedeViewSet = generate_viewset(
    SedeService,
    SedeRepositoryImpl,
    SedeSerializer,
    "Sede",
)

ProcedenciaViewSet = generate_viewset(
    ProcedenciaService,
    ProcedenciaRepositoryImpl,
    ProcedenciaSerializer,
    "Procedencia",
)

ActasViewSet = generate_viewset(
    ActaService,
    ActaRepositoryImpl,
    ActaSerializer,
    "Acta",
)

ActaGeneracionResiduoViewSet = generate_viewset(
    ActaGeneracionResiduoService,
    ActaGeneracionResiduoRepositoryImpl,
    ActaGeneracionResiduoSerializer,
    "ActaGeneracionResiduo",
)

GeneracionResiduoViewSet = generate_viewset(
    GeneracionResiduoService,
    GeneracionResiduoRepositoryImpl,
    GeneracionResiduoSerializer,
    "GeneracionResiduo",
)

AreaViewSet = generate_viewset(
    AreaService,
    AreaRepositoryImpl,
    AreaSerializer,
    "Area",
)

CategoriaResiduoViewSet = generate_viewset(
    CategoriaResiduoService,
    CategoriaResiduoRepositoryImpl,
    CategoriaResiduoSerializer,
    "CategoriaResiduo",
)

ResiduoEspecificoViewSet = generate_viewset(
    ResiduoEspecificoService,
    ResiduoEspecificoRepositoryImpl,
    ResiduoEspecificoSerializer,
    "ResiduoEspecifico",
)

CentroCostoViewSet = generate_viewset(
    CentroCostoService,
    CentroCostoRepositoryImpl,
    CentroCostoSerializer,
    "CentroCosto",
)

RolAdministrativoViewSet = generate_viewset(
    RolAdministrativoService,
    RolAdministrativoRepositoryImpl,
    RolAdministrativoSerializer,
    "RolAdministrativo",
)

OperarioViewSet = generate_viewset(
    OperarioService,
    OperarioRepositoryImpl,
    OperarioSerializer,
    "Operario",
)

SubAreaViewSet = generate_viewset(
    SubAreaService,
    SubAreaRepositoryImpl,
    SubAreaSerializer,
    "SubArea",
)

NovedadConciliacionViewSet = generate_viewset(
    NovedadConciliacionService,
    NovedadConciliacionRepositoryImpl,
    NovedadConciliacionSerializer,
    "NovedadConciliacion",
)

class ConciliarActaViewSet(viewsets.ViewSet):

    @action(detail=True, methods=["post"])
    def conciliar(self, request, pk=None):
        print("=== INICIO ConciliarActaViewSet.conciliar ===")
        print("Acta ID (pk):", pk)
        print("Datos recibidos:", request.data)

        service = ConciliacionService()  # <--- Cambiado aquí

        try:
            # pk será el acta_id
            serializer = ConciliacionSerializer(
                data=request.data,
                context={"service": service, "acta_id": pk}
            )
            if not serializer.is_valid():
                print("Errores de validación:", serializer.errors)
            serializer.is_valid(raise_exception=True)

            result = serializer.save()
            print("Conciliación exitosa:", result)
            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            print("ERROR en ConciliarActaViewSet.conciliar:")
            traceback.print_exc()
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )