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
    NumeracionActasService,
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
    NumeracionActasRepositoryImpl,
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
    NumeracionActasSerializer,
)


# ====================================================
# GENERADOR GENÉRICO DE VIEWSETS CON PATCH
# ====================================================

def generate_viewset(service_cls, repository_classes, serializer_cls, tag_name):
    """
    Genera un ViewSet genérico para operaciones CRUD incluyendo PATCH.
    """
    # Normalizar a lista
    if not isinstance(repository_classes, (list, tuple)):
        repository_classes = [repository_classes]

    # Instanciar repos dinámicamente
    repositories = [repo() for repo in repository_classes]

    @extend_schema_view(
        list=extend_schema(summary=f"Listar {tag_name}"),
        retrieve=extend_schema(summary=f"Obtener {tag_name} por ID"),
        create=extend_schema(summary=f"Crear un {tag_name}"),
        update=extend_schema(summary=f"Actualizar un {tag_name}"),
        partial_update=extend_schema(summary=f"Actualizar parcialmente un {tag_name}"),  # ✅ NUEVO: PATCH
        destroy=extend_schema(summary=f"Eliminar un {tag_name}")
    )
    class GenericViewSet(viewsets.ViewSet):
        permission_classes = [AllowAny]
        service = service_cls(*repositories)

        def list(self, request):
            data = self.service.list_all()
            serializer = serializer_cls(data, many=True)
            return Response(serializer.data)

        def retrieve(self, request, pk=None):
            item = self.service.get_by_id(int(pk))
            if not item:
                return Response({"detail": f"{tag_name} no encontrado."}, status=404)
            return Response(serializer_cls(item).data)

        def create(self, request):
            serializer = serializer_cls(data=request.data)
            serializer.is_valid(raise_exception=True)
            created = self.service.create(serializer.validated_data)
            return Response(serializer_cls(created).data, status=201)

        def update(self, request, pk=None):
            """
            PUT - Actualización completa
            """
            serializer = serializer_cls(data=request.data)
            serializer.is_valid(raise_exception=True)
            updated = self.service.update(int(pk), serializer.validated_data)
            return Response(serializer_cls(updated).data)

        def partial_update(self, request, pk=None):
            """
            PATCH - Actualización parcial
            """
            # Obtener el objeto existente
            item = self.service.get_by_id(int(pk))
            if not item:
                return Response({"detail": f"{tag_name} no encontrado."}, status=404)
            
            # Serializar con partial=True para permitir actualización parcial
            serializer = serializer_cls(item, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            
            # Actualizar solo los campos proporcionados
            updated = self.service.update(int(pk), serializer.validated_data)
            return Response(serializer_cls(updated).data)

        def destroy(self, request, pk=None):
            self.service.delete(int(pk))
            return Response(status=204)

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
    [ActaRepositoryImpl, NumeracionActasRepositoryImpl],
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

        service = ConciliacionService()

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
        
@extend_schema_view(
    list=extend_schema(summary="Listar numeración de actas por año"),
    retrieve=extend_schema(summary="Obtener numeración de un año específico")
)
class NumeracionActasViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]
    service = NumeracionActasService(NumeracionActasRepositoryImpl())

    def list(self, request):
        return Response(
            {"message": "Use el endpoint /api/numeracion-actas/{year}/ para consultar un año específico"},
            status=status.HTTP_200_OK
        )

    def retrieve(self, request, pk=None):
        try:
            year = int(pk)
            numeracion = self.service.get_or_create_year(year)
            serializer = NumeracionActasSerializer(numeracion)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValueError:
            return Response(
                {"error": "El año debe ser un número entero válido"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=["post"], url_path="siguiente")
    def siguiente_numero(self, request, pk=None):
        try:
            year = int(pk)
            siguiente = self.service.increment_and_get(year)
            return Response(
                {
                    "year": year,
                    "numero_acta": siguiente,
                    "numero_acta_formateado": f"{siguiente:04d}"
                },
                status=status.HTTP_200_OK
            )
        except ValueError:
            return Response(
                {"error": "El año debe ser un número entero válido"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=["get"], url_path="actual")
    def numero_actual(self, request, pk=None):
        try:
            year = int(pk)
            numero_actual = self.service.get_current_number(year)
            return Response(
                {
                    "year": year,
                    "ultimo_numero": numero_actual,
                    "ultimo_numero_formateado": f"{numero_actual:04d}"
                },
                status=status.HTTP_200_OK
            )
        except ValueError:
            return Response(
                {"error": "El año debe ser un número entero válido"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )