from typing import List

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
)

from app.infrastructure.models import (
    Sede,
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
)

from django.forms.models import model_to_dict


def to_dto(instance, dto_class):
    """Convierte una instancia de modelo a un DTO."""
    return dto_class(**model_to_dict(instance))


# ---------- PROCEDENCIA ----------
class ProcedenciaRepositoryImpl(ProcedenciaRepository):
    def list_all(self, filtros: dict = {}) -> list[Procedencia]:
        queryset = ProcedenciaModel.objects.filter(**filtros)
        return [
            Procedencia(
                id=p.id,
                nombre=p.nombre,
                sede_id=p.sede_id
            )
            for p in queryset
        ]

    def get_by_id(self, id: int) -> Procedencia:
        p = ProcedenciaModel.objects.get(id=id)
        return Procedencia(
            id=p.id,
            nombre=p.nombre,
            sede_id=p.sede_id
        )

    def create(self, data: Procedencia) -> Procedencia:
        obj = ProcedenciaModel.objects.create(**data.__dict__)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: Procedencia) -> Procedencia:
        ProcedenciaModel.objects.filter(id=id).update(**data.__dict__)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        ProcedenciaModel.objects.filter(id=id).delete()



# ---------- ACTA ----------
class ActaRepositoryImpl(ActaRepository):
    def list_all(self, filtros: dict = {}) -> list[Acta]:
        queryset = ActaModel.objects.filter(**filtros)
        return [
            Acta(
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
            for a in queryset
        ]

    def get_by_id(self, id: int) -> Acta:
        a = ActaModel.objects.get(id=id)
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
        obj = ActaModel.objects.create(**data.__dict__)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: Acta) -> Acta:
        ActaModel.objects.filter(id=id).update(**data.__dict__)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        ActaModel.objects.filter(id=id).delete()


# ---------- ACTA GENERACION RESIDUO ----------
class ActaGeneracionResiduoRepositoryImpl(ActaGeneracionResiduoRepository):
    def list_all(self, filtros: dict = {}) -> List[ActaGeneracionResiduo]:
        queryset = ActaGeneracionResiduoModel.objects.filter(**filtros)
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
        obj = ActaGeneracionResiduoModel.objects.get(id=id)
        return ActaGeneracionResiduo(
            id=obj.id,
            acta_id=obj.acta_id,
            generacion_residuo_id=obj.generacion_residuo_id,
            peso_reportado=obj.peso_reportado,
            peso_conciliado=obj.peso_conciliado,
        )

    def create(self, entity: ActaGeneracionResiduo) -> ActaGeneracionResiduo:
        obj = ActaGeneracionResiduoModel.objects.create(**entity.__dict__)
        return self.get_by_id(obj.id)

    def update(self, id: int, entity: ActaGeneracionResiduo) -> ActaGeneracionResiduo:
        ActaGeneracionResiduoModel.objects.filter(id=id).update(**entity.__dict__)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        ActaGeneracionResiduoModel.objects.filter(id=id).delete()


# ---------- GENERACION RESIDUO ----------
class GeneracionResiduoRepositoryImpl(GeneracionResiduoRepository):
    def list_all(self, filtros: dict = {}) -> list[GeneracionResiduo]:
        queryset = GeneracionResiduoModel.objects.filter(**filtros)
        return [
            GeneracionResiduo(
                id=g.id,
                fecha=g.fecha,
                peso=g.peso,
                residuo_id=g.residuo_id,
                operario_id=g.operario_id,
                motivo=g.motivo,
            )
            for g in queryset
        ]

    def get_by_id(self, id: int) -> GeneracionResiduo:
        g = GeneracionResiduoModel.objects.get(id=id)
        return GeneracionResiduo(
            id=g.id,
            fecha=g.fecha,
            peso=g.peso,
            residuo_id=g.residuo_id,
            operario_id=g.operario_id,
            motivo=g.motivo,
        )

    def create(self, data: GeneracionResiduo) -> GeneracionResiduo:
        obj = GeneracionResiduoModel.objects.create(**data.__dict__)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: GeneracionResiduo) -> GeneracionResiduo:
        GeneracionResiduoModel.objects.filter(id=id).update(**data.__dict__)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        GeneracionResiduoModel.objects.filter(id=id).delete()


# ---------- AREA ----------
class AreaRepositoryImpl(AreaRepository):
    def list_all(self, filtros: dict = {}) -> list[Area]:
        queryset = AreaModel.objects.filter(**filtros)
        return [Area(id=a.id, nombre=a.nombre, procedencia_id=a.procedencia_id) for a in queryset]

    def get_by_id(self, id: int) -> Area:
        a = AreaModel.objects.get(id=id)
        return Area(id=a.id, nombre=a.nombre, procedencia_id=a.procedencia_id)

    def create(self, data: Area) -> Area:
        obj = AreaModel.objects.create(**data.__dict__)
        return self.get_by_id(obj.id)
    
    def update(self, id: int, data: Area) -> Area:
        AreaModel.objects.filter(id=id).update(**data.__dict__)
        return self.get_by_id(id)
    
    def delete(self, id: int) -> None:
        AreaModel.objects.filter(id=id).delete()

# ---------- SUBAREA ----------
class SubAreaRepositoryImpl(SubAreaRepository):
    def list_all(self, filtros: dict = {}) -> list[SubArea]:
        queryset = SubAreaModel.objects.filter(**filtros)
        return [
            SubArea(
                id=s.id,
                nombre=s.nombre,
                area_id=s.area_id
            )
            for s in queryset
        ]

    def get_by_id(self, id: int) -> SubArea:
        s = SubAreaModel.objects.get(id=id)
        return SubArea(
            id=s.id,
            nombre=s.nombre,
            area_id=s.area_id
        )

    def create(self, data: SubArea) -> SubArea:
        obj = SubAreaModel.objects.create(**data.__dict__)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: SubArea) -> SubArea:
        SubAreaModel.objects.filter(id=id).update(**data.__dict__)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        SubAreaModel.objects.filter(id=id).delete()


# ---------- CATEGORIA RESIDUO ----------
class CategoriaResiduoRepositoryImpl(CategoriaResiduoRepository):
    def list_all(self, filtros: dict = {}) -> list[CategoriaResiduo]:
        queryset = CategoriaResiduoModel.objects.filter(**filtros)
        return [
            CategoriaResiduo(
                id=c.id,
                nombre=c.nombre,
                subarea_id=c.subarea_id
            )
            for c in queryset
        ]

    def get_by_id(self, id: int) -> CategoriaResiduo:
        c = CategoriaResiduoModel.objects.get(id=id)
        return CategoriaResiduo(
            id=c.id,
            nombre=c.nombre,
            subarea_id=c.subarea_id
        )

    def create(self, data: CategoriaResiduo) -> CategoriaResiduo:
        obj = CategoriaResiduoModel.objects.create(**data.__dict__)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: CategoriaResiduo) -> CategoriaResiduo:
        CategoriaResiduoModel.objects.filter(id=id).update(**data.__dict__)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        CategoriaResiduoModel.objects.filter(id=id).delete()


# ---------- RESIDUO ESPECIFICO ----------
class ResiduoEspecificoRepositoryImpl(ResiduoEspecificoRepository):
    def list_all(self, filtros: dict = {}) -> list[ResiduoEspecifico]:
        queryset = ResiduoEspecificoModel.objects.filter(**filtros)
        return [ResiduoEspecifico(id=r.id, nombre=r.nombre, categoria_id=r.categoria_id) for r in queryset]

    def get_by_id(self, id: int) -> ResiduoEspecifico:
        r = ResiduoEspecificoModel.objects.get(id=id)
        return ResiduoEspecifico(id=r.id, nombre=r.nombre, categoria_id=r.categoria_id)

    def create(self, data: ResiduoEspecifico) -> ResiduoEspecifico:
        obj = ResiduoEspecificoModel.objects.create(**data.__dict__)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: ResiduoEspecifico) -> ResiduoEspecifico:
        ResiduoEspecificoModel.objects.filter(id=id).update(**data.__dict__)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        ResiduoEspecificoModel.objects.filter(id=id).delete()


# ---------- CENTRO DE COSTOS ----------
class CentroCostoRepositoryImpl(CentroCostoRepository):
    def list_all(self, filtros: dict = {}) -> list[CentroCosto]:
        queryset = CentroCostoModel.objects.filter(**filtros)
        return [
            CentroCosto(
                id=cc.id,
                codigo=cc.codigo,
                nombre=cc.nombre,  # <- obligatorio
                clase_movimiento=cc.clase_movimiento,  # <- obligatorio
                subarea_id=cc.subarea_id
            )
            for cc in queryset
        ]

    def get_by_id(self, id: int) -> CentroCosto:
        cc = CentroCostoModel.objects.get(id=id)
        return CentroCosto(
            id=cc.id,
            codigo=cc.codigo,
            nombre=cc.nombre,
            clase_movimiento=cc.clase_movimiento,
            subarea_id=cc.subarea_id
        )

    def create(self, data: CentroCosto) -> CentroCosto:
        obj = CentroCostoModel.objects.create(**data.__dict__)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: CentroCosto) -> CentroCosto:
        CentroCostoModel.objects.filter(id=id).update(**data.__dict__)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        CentroCostoModel.objects.filter(id=id).delete()



# ---------- ROL ADMINISTRATIVO ----------
class RolAdministrativoRepositoryImpl(RolAdministrativoRepository):
    def list_all(self, filtros: dict = {}) -> list[RolAdministrativo]:
        queryset = RolAdministrativoModel.objects.filter(**filtros)
        return [RolAdministrativo(id=ra.id, nombre=ra.nombre) for ra in queryset]

    def get_by_id(self, id: int) -> RolAdministrativo:
        ra = RolAdministrativoModel.objects.get(id=id)
        return RolAdministrativo(id=ra.id, nombre=ra.nombre)

    def create(self, data: RolAdministrativo) -> RolAdministrativo:
        obj = RolAdministrativoModel.objects.create(**data.__dict__)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: RolAdministrativo) -> RolAdministrativo:
        RolAdministrativoModel.objects.filter(id=id).update(**data.__dict__)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        RolAdministrativoModel.objects.filter(id=id).delete()


# ---------- OPERARIO ----------
class OperarioRepositoryImpl(OperarioRepository):
    def list_all(self, filtros: dict = {}) -> list[Operario]:
        queryset = OperarioModel.objects.filter(**filtros)
        return [
            Operario(
                id=o.id,
                nombre=o.nombre,
                apellido=o.apellido,
                documento=o.documento,
                subarea_id=o.subarea_id
            )
            for o in queryset
        ]

    def get_by_id(self, id: int) -> Operario:
        o = OperarioModel.objects.get(id=id)
        return Operario(
            id=o.id,
            nombre=o.nombre,
            apellido=o.apellido,
            documento=o.documento,
            subarea_id=o.subarea_id
        )

    def create(self, entity: Operario) -> Operario:
        obj = OperarioModel.objects.create(**entity.__dict__)
        return self.get_by_id(obj.id)

    def update(self, id: int, entity: Operario) -> Operario:
        OperarioModel.objects.filter(id=id).update(**entity.__dict__)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        OperarioModel.objects.filter(id=id).delete()

