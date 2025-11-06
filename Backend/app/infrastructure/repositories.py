from typing import List
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import IntegrityError, DatabaseError

from app.domain.entities import (
    Procedencia,
    ActaGeneracionResiduo,
    GeneracionResiduo,
    Area,
    SubArea,
    Acta,
    CategoriaResiduo,
    ResiduoEspecifico,
    CentroCosto,
    RolAdministrativo,
    Operario,
    NovedadConciliacion,
)

from app.domain.repositories import (
    ProcedenciaRepository,
    ActaRepository,
    ActaGeneracionResiduoRepository,
    GeneracionResiduoRepository,
    AreaRepository,
    ResiduoEspecificoRepository,
    CategoriaResiduoRepository,
    CentroCostoRepository,
    RolAdministrativoRepository,
    OperarioRepository,
    SubAreaRepository,
    NovedadConciliacionRepository,
)

from app.infrastructure.models import (
    Procedencia as ProcedenciaModel,
    Area as AreaModel,
    CategoriaResiduo as CategoriaResiduoModel,
    ResiduoEspecifico as ResiduoEspecificoModel,
    RolAdministrativo as RolAdministrativoModel,
    Operario as OperarioModel,
    CentroCosto as CentroCostoModel,
    Acta as ActaModel,
    GeneracionResiduo as GeneracionResiduoModel,
    ActaGeneracionResiduo as ActaGeneracionResiduoModel,
    SubArea as SubAreaModel,
    NovedadConciliacion as NovedadConciliacionModel,
)

from django.forms.models import model_to_dict


def safe_get(model, **kwargs):
    """Obtiene una instancia o lanza un ValueError con mensaje controlado."""
    try:
        return model.objects.get(**kwargs)
    except ObjectDoesNotExist:
        raise ValueError(f"No existe un registro con los criterios {kwargs}")
    except DatabaseError as e:
        raise ValueError(f"Error de base de datos al obtener registro: {str(e)}")


def safe_create(model, data):
    """Crea un registro y captura errores de integridad o validación."""
    try:
        obj = model.objects.create(**data.__dict__)
        return obj
    except IntegrityError as e:
        raise ValueError(f"Error de integridad al crear el registro: {str(e)}")
    except ValidationError as e:
        raise ValueError(f"Error de validación al crear el registro: {str(e)}")
    except DatabaseError as e:
        raise ValueError(f"Error de base de datos al crear registro: {str(e)}")


def safe_update(model, id, data):
    """Actualiza un registro y verifica su existencia."""
    if not model.objects.filter(id=id).exists():
        raise ValueError(f"No existe el registro con id {id} para actualizar")
    try:
        model.objects.filter(id=id).update(**data.__dict__)
    except IntegrityError as e:
        raise ValueError(f"Error de integridad al actualizar: {str(e)}")
    except ValidationError as e:
        raise ValueError(f"Error de validación al actualizar: {str(e)}")
    except DatabaseError as e:
        raise ValueError(f"Error de base de datos al actualizar: {str(e)}")


def safe_delete(model, id):
    """Elimina un registro con control de integridad referencial."""
    if not model.objects.filter(id=id).exists():
        raise ValueError(f"No existe el registro con id {id} para eliminar")
    try:
        model.objects.filter(id=id).delete()
    except IntegrityError as e:
        raise ValueError(f"No se puede eliminar el registro (referenciado por otros): {str(e)}")
    except DatabaseError as e:
        raise ValueError(f"Error de base de datos al eliminar: {str(e)}")


# ---------- REPOSITORIES ----------

class ProcedenciaRepositoryImpl(ProcedenciaRepository):
    def list_all(self, filtros: dict = {}) -> list[Procedencia]:
        return [Procedencia(**model_to_dict(p)) for p in ProcedenciaModel.objects.filter(**filtros)]

    def get_by_id(self, id: int) -> Procedencia:
        p = safe_get(ProcedenciaModel, id=id)
        return Procedencia(**model_to_dict(p))

    def create(self, data: Procedencia) -> Procedencia:
        obj = safe_create(ProcedenciaModel, data)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: Procedencia) -> Procedencia:
        safe_update(ProcedenciaModel, id, data)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        safe_delete(ProcedenciaModel, id)


class ActaRepositoryImpl(ActaRepository):
    def list_all(self, filtros: dict = {}) -> list[Acta]:
        return [Acta(**model_to_dict(a)) for a in ActaModel.objects.filter(**filtros)]

    def get_by_id(self, id: int) -> Acta:
        a = safe_get(ActaModel, id=id)
        return Acta(**model_to_dict(a))

    def create(self, data: Acta) -> Acta:
        obj = safe_create(ActaModel, data)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: Acta) -> Acta:
        safe_update(ActaModel, id, data)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        safe_delete(ActaModel, id)


class ActaGeneracionResiduoRepositoryImpl(ActaGeneracionResiduoRepository):
    def list_all(self, filtros: dict = {}) -> List[ActaGeneracionResiduo]:
        return [ActaGeneracionResiduo(**model_to_dict(a)) for a in ActaGeneracionResiduoModel.objects.filter(**filtros)]

    def get_by_id(self, id: int) -> ActaGeneracionResiduo:
        obj = safe_get(ActaGeneracionResiduoModel, id=id)
        return ActaGeneracionResiduo(**model_to_dict(obj))

    def create(self, entity: ActaGeneracionResiduo) -> ActaGeneracionResiduo:
        obj = safe_create(ActaGeneracionResiduoModel, entity)
        return self.get_by_id(obj.id)

    def update(self, id: int, entity: ActaGeneracionResiduo) -> ActaGeneracionResiduo:
        safe_update(ActaGeneracionResiduoModel, id, entity)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        safe_delete(ActaGeneracionResiduoModel, id)


class GeneracionResiduoRepositoryImpl(GeneracionResiduoRepository):
    def list_all(self, filtros: dict = {}) -> list[GeneracionResiduo]:
        return [GeneracionResiduo(**model_to_dict(g)) for g in GeneracionResiduoModel.objects.filter(**filtros)]

    def get_by_id(self, id: int) -> GeneracionResiduo:
        g = safe_get(GeneracionResiduoModel, id=id)
        return GeneracionResiduo(**model_to_dict(g))

    def create(self, data: GeneracionResiduo) -> GeneracionResiduo:
        obj = safe_create(GeneracionResiduoModel, data)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: GeneracionResiduo) -> GeneracionResiduo:
        safe_update(GeneracionResiduoModel, id, data)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        safe_delete(GeneracionResiduoModel, id)


class AreaRepositoryImpl(AreaRepository):
    def list_all(self, filtros: dict = {}) -> list[Area]:
        return [Area(**model_to_dict(a)) for a in AreaModel.objects.filter(**filtros)]

    def get_by_id(self, id: int) -> Area:
        a = safe_get(AreaModel, id=id)
        return Area(**model_to_dict(a))

    def create(self, data: Area) -> Area:
        obj = safe_create(AreaModel, data)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: Area) -> Area:
        safe_update(AreaModel, id, data)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        safe_delete(AreaModel, id)


class SubAreaRepositoryImpl(SubAreaRepository):
    def list_all(self, filtros: dict = {}) -> list[SubArea]:
        return [SubArea(**model_to_dict(s)) for s in SubAreaModel.objects.filter(**filtros)]

    def get_by_id(self, id: int) -> SubArea:
        s = safe_get(SubAreaModel, id=id)
        return SubArea(**model_to_dict(s))

    def create(self, data: SubArea) -> SubArea:
        obj = safe_create(SubAreaModel, data)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: SubArea) -> SubArea:
        safe_update(SubAreaModel, id, data)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        safe_delete(SubAreaModel, id)


class CategoriaResiduoRepositoryImpl(CategoriaResiduoRepository):
    def list_all(self, filtros: dict = {}) -> list[CategoriaResiduo]:
        return [CategoriaResiduo(**model_to_dict(c)) for c in CategoriaResiduoModel.objects.filter(**filtros)]

    def get_by_id(self, id: int) -> CategoriaResiduo:
        c = safe_get(CategoriaResiduoModel, id=id)
        return CategoriaResiduo(**model_to_dict(c))

    def create(self, data: CategoriaResiduo) -> CategoriaResiduo:
        obj = safe_create(CategoriaResiduoModel, data)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: CategoriaResiduo) -> CategoriaResiduo:
        safe_update(CategoriaResiduoModel, id, data)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        safe_delete(CategoriaResiduoModel, id)


class ResiduoEspecificoRepositoryImpl(ResiduoEspecificoRepository):
    def list_all(self, filtros: dict = {}) -> list[ResiduoEspecifico]:
        return [ResiduoEspecifico(**model_to_dict(r)) for r in ResiduoEspecificoModel.objects.filter(**filtros)]

    def get_by_id(self, id: int) -> ResiduoEspecifico:
        r = safe_get(ResiduoEspecificoModel, id=id)
        return ResiduoEspecifico(**model_to_dict(r))

    def create(self, data: ResiduoEspecifico) -> ResiduoEspecifico:
        obj = safe_create(ResiduoEspecificoModel, data)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: ResiduoEspecifico) -> ResiduoEspecifico:
        safe_update(ResiduoEspecificoModel, id, data)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        safe_delete(ResiduoEspecificoModel, id)


class CentroCostoRepositoryImpl(CentroCostoRepository):
    def list_all(self, filtros: dict = {}) -> list[CentroCosto]:
        return [CentroCosto(**model_to_dict(c)) for c in CentroCostoModel.objects.filter(**filtros)]

    def get_by_id(self, id: int) -> CentroCosto:
        c = safe_get(CentroCostoModel, id=id)
        return CentroCosto(**model_to_dict(c))

    def create(self, data: CentroCosto) -> CentroCosto:
        obj = safe_create(CentroCostoModel, data)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: CentroCosto) -> CentroCosto:
        safe_update(CentroCostoModel, id, data)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        safe_delete(CentroCostoModel, id)


class RolAdministrativoRepositoryImpl(RolAdministrativoRepository):
    def list_all(self, filtros: dict = {}) -> list[RolAdministrativo]:
        return [RolAdministrativo(**model_to_dict(r)) for r in RolAdministrativoModel.objects.filter(**filtros)]

    def get_by_id(self, id: int) -> RolAdministrativo:
        r = safe_get(RolAdministrativoModel, id=id)
        return RolAdministrativo(**model_to_dict(r))

    def create(self, data: RolAdministrativo) -> RolAdministrativo:
        obj = safe_create(RolAdministrativoModel, data)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: RolAdministrativo) -> RolAdministrativo:
        safe_update(RolAdministrativoModel, id, data)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        safe_delete(RolAdministrativoModel, id)


class OperarioRepositoryImpl(OperarioRepository):
    def list_all(self, filtros: dict = {}) -> list[Operario]:
        return [Operario(**model_to_dict(o)) for o in OperarioModel.objects.filter(**filtros)]

    def get_by_id(self, id: int) -> Operario:
        o = safe_get(OperarioModel, id=id)
        return Operario(**model_to_dict(o))

    def create(self, data: Operario) -> Operario:
        obj = safe_create(OperarioModel, data)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: Operario) -> Operario:
        safe_update(OperarioModel, id, data)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        safe_delete(OperarioModel, id)


class NovedadConciliacionRepositoryImpl(NovedadConciliacionRepository):
    def list_all(self, filtros: dict = {}) -> list[NovedadConciliacion]:
        return [NovedadConciliacion(**model_to_dict(n)) for n in NovedadConciliacionModel.objects.filter(**filtros)]

    def get_by_id(self, id: int) -> NovedadConciliacion:
        n = safe_get(NovedadConciliacionModel, id=id)
        return NovedadConciliacion(**model_to_dict(n))

    def create(self, entity: NovedadConciliacion) -> NovedadConciliacion:
        obj = safe_create(NovedadConciliacionModel, entity)
        return self.get_by_id(obj.id)

    def update(self, id: int, entity: NovedadConciliacion) -> NovedadConciliacion:
        safe_update(NovedadConciliacionModel, id, entity)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        safe_delete(NovedadConciliacionModel, id)
