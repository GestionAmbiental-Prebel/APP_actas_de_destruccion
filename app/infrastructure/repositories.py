from typing import List, Optional

"""
    En este archivo se implementan los repositorios de la aplicacion,
    los cuales son responsables de la comunicacion con la base de datos.
    Se utilizan los modelos de Django para realizar las operaciones CRUD
    O podrias implementar los repositorios utilizando SQLAlchemy o cualquier otro ORM.
"""

"""
    Importaciones necesarias para el funcionamiento de los repositorios.
"""
from app.domain.entities import (
    Gerencia,
    Procedencia,
    ActaGeneracionResiduo)

from app.domain.repositories import (
    GerenciaRepository,
    ProcedenciaRepository,
    ActaRepository,
    ActaGeneracionResiduoRepository,
    UsuarioRepository,)

from app.models import (GerenciaModel)
from app.infrastructure.models_residuos import (
    Procedencia,
    Acta,
    ActaGeneracionResiduo,
    Generacionresiduo,Usuario,)
from django.forms.models import model_to_dict

""" funciones de utilidad para convertir entre modelos y DTOs """
def to_dto(instance, dto_class):
    """
    Convierte una instancia de modelo a un DTO (Data Transfer Object).
    :param instance: Instancia del modelo a convertir.
    :param dto_class: Clase del DTO al que se convertirá la instancia.
    """
    return dto_class(**model_to_dict(instance))

""" Ejemplo de implementación de un repositorio para el modelo Gerencia """
# ---------- GERENCIA ----------
class GerenciaRepositoryImpl(GerenciaRepository):
    def list_all(self, filtros: dict = {}) -> list[Gerencia]:
        print("filtros", filtros)
        queryset = GerenciaModel.objects.filter(**filtros)
        return [Gerencia(
            id=g.id,
            nombre=g.nombre,
            descripcion=g.descripcion,
            image=g.image,
            estado=g.estado,
        ) for g in queryset]

    def get_by_id(self, id: int) -> Gerencia:
        g = GerenciaModel.objects.get(id=id)
        return Gerencia(
            id=g.id,
            nombre=g.nombre,
            descripcion=g.descripcion
        )

    def create(self, data: Gerencia) -> Gerencia:
        obj = GerenciaModel.objects.create(**data.__dict__)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: Gerencia) -> Gerencia:
        GerenciaModel.objects.filter(id=id).update(**data.__dict__)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        GerenciaModel.objects.filter(id=id).delete()


# ---------- PROCEDENCIA ----------
class ProcedenciaRepositoryImpl(ProcedenciaRepository):
    def list_all(self, filtros: dict = {}) -> list[Procedencia]:
        queryset = Procedencia.objects.filter(**filtros)
        return [Procedencia(
            id=p.id,
            nombre=p.nombre,
            sede=p.sede,
        ) for p in queryset]

    def get_by_id(self, id: int) -> Procedencia:
        p = Procedencia.objects.get(id=id)
        return Procedencia(
            id=p.id,
            nombre=p.nombre,
            sede=p.sede,
        )

    def create(self, data: Procedencia) -> Procedencia:
        obj = Procedencia.objects.create(**data.__dict__)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: Procedencia) -> Procedencia:
        Procedencia.objects.filter(id=id).update(**data.__dict__)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        Procedencia.objects.filter(id=id).delete()
        
# ---------- ACTA ----------
class ActaRepositoryImpl(ActaRepository):
    def list_all(self, filtros: dict = {}) -> list[Acta]:
        queryset = Acta.objects.filter(**filtros)
        return [Acta(
            id=a.id,
            numero_acta=a.numero_acta,
            fecha_acta=a.fecha_acta,
            area_id=a.area_id,
            centro_costo_id=a.centro_costo_id,
            operario_entrega_id=a.operario_entrega_id,
            operario_recepcion_id=a.operario_recepcion_id,
            firma_entrega=a.firma_entrega,
            firma_recepcion=a.firma_recepcion,
        ) for a in queryset]

    def get_by_id(self, id: int) -> Acta:
        a = Acta.objects.get(id=id)
        return Acta(
            id=a.id,
            numero_acta=a.numero_acta,
            fecha_acta=a.fecha_acta,
            area_id=a.area_id,
            centro_costo_id=a.centro_costo_id,
            operario_entrega_id=a.operario_entrega_id,
            operario_recepcion_id=a.operario_recepcion_id,
            firma_entrega=a.firma_entrega,
            firma_recepcion=a.firma_recepcion,
        )

    def create(self, data: Acta) -> Acta:
        obj = Acta.objects.create(**data.__dict__)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: Acta) -> Acta:
        Acta.objects.filter(id=id).update(**data.__dict__)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        Acta.objects.filter(id=id).delete()

# ---------- ACTA GENERACION RESIDUO ----------
class ActaGeneracionResiduoRepositoryImpl(ActaGeneracionResiduoRepository):
    def list_all(self, filtros: dict = {}) -> List[ActaGeneracionResiduo]:
        queryset = ActaGeneracionResiduo.objects.filter(**filtros)
        return [
            ActaGeneracionResiduo(
                id=obj.id,
                acta_id=obj.acta_id,
                generacion_residuo_id=obj.generacion_residuo_id,
                peso_reportado=obj.peso_reportado,
                peso_conciliado=obj.peso_conciliado,
            )
            for obj in queryset
        ]

    def get_by_id(self, id: int) -> ActaGeneracionResiduo:
        obj = ActaGeneracionResiduo.objects.get(id=id)
        return ActaGeneracionResiduo(
            id=obj.id,
            acta_id=obj.acta_id,
            generacion_residuo_id=obj.generacion_residuo_id,
            peso_reportado=obj.peso_reportado,
            peso_conciliado=obj.peso_conciliado,
        )

    def create(self, entity: ActaGeneracionResiduo) -> ActaGeneracionResiduo:
        obj = ActaGeneracionResiduo.objects.create(**entity.__dict__)
        return self.get_by_id(obj.id)

    def update(self, id: int, entity: ActaGeneracionResiduo) -> ActaGeneracionResiduo:
        ActaGeneracionResiduo.objects.filter(id=id).update(**entity.__dict__)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        ActaGeneracionResiduo.objects.filter(id=id).delete()

# ---------- USUARIO ----------
class UsuarioRepositoryImpl(UsuarioRepository):
    def list_all(self, filtros: dict = {}) -> list[Usuario]:
        queryset = Usuario.objects.filter(**filtros)
        return [
            Usuario(
                id=u.id,
                usernameA=u.usernameA,
                password_hash=u.password_hash,
                area_id=u.area_id,
                rol_administrativo_id=u.rol_administrativo_id,
            )
            for u in queryset
        ]

    def get_by_id(self, id: int) -> Usuario:
        u = Usuario.objects.get(id=id)
        return Usuario(
            id=u.id,
            usernameA=u.usernameA,
            password_hash=u.password_hash,
            area_id=u.area_id,
            rol_administrativo_id=u.rol_administrativo_id,
        )

    def create(self, data: Usuario) -> Usuario:
        obj = Usuario.objects.create(**data.__dict__)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: Usuario) -> Usuario:
        Usuario.objects.filter(id=id).update(**data.__dict__)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        Usuario.objects.filter(id=id).delete()