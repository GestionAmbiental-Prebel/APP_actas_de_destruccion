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
    Procedencia,
    ActaGeneracionResiduo,
    GeneracionResiduo,
    Area,Acta,CategoriaResiduo,
    Usuario,
    ResiduoEspecifico,
    CentroCosto,
    RolAdministrativo,
    Operario,)

from app.domain.repositories import (
    ProcedenciaRepository,
    ActaRepository,
    ActaGeneracionResiduoRepository,
    UsuarioRepository,
    GeneracionResiduoRepository,
    AreaRepository,ResiduoEspecificoRepository,
    CategoriaResiduoRepository,CentroCostoRepository,
    RolAdministrativoRepository,
    OperarioRepository,)


from app.infrastructure.models import (
    Procedencia,
    Acta,
    ActaGeneracionResiduo,
    GeneracionResiduo,
    Usuario,
    Area,
    ResiduoEspecifico,
    CentroCosto,
    RolAdministrativo,
    Operario)

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
                username=u.username,  # Cambiado de usernameA a username
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
            username=u.username,  # Cambiado de usernameA a username
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


# ---------- GENERACION RESIDUO ----------
class GeneracionResiduoRepositoryImpl(GeneracionResiduoRepository):
    def list_all(self, filtros: dict = {}) -> list[GeneracionResiduo]:
        queryset = GeneracionResiduo.objects.filter(**filtros)
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
        g = GeneracionResiduo.objects.get(id=id)
        return GeneracionResiduo(
            id=g.id,
            fecha=g.fecha,
            peso=g.peso,
            residuo_id=g.residuo_id,
            operario_id=g.operario_id,
            motivo=g.motivo,
        )

    def create(self, data: GeneracionResiduo) -> GeneracionResiduo:
        obj = GeneracionResiduo.objects.create(**data.__dict__)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: GeneracionResiduo) -> GeneracionResiduo:
        GeneracionResiduo.objects.filter(id=id).update(**data.__dict__)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        GeneracionResiduo.objects.filter(id=id).delete()

# ---------- AREA ----------
class AreaRepositoryImpl(AreaRepository):
    def list_all(self, filtros: dict = {}) -> list[Area]:
        queryset = Area.objects.filter(**filtros)
        return [
            Area(
                id=a.id,
                nombre=a.nombre,
                procedencia_id=a.procedencia_id,
            )
            for a in queryset
        ]

    def get_by_id(self, id: int) -> Area:
        a = Area.objects.get(id=id)
        return Area(
            id=a.id,
            nombre=a.nombre,
            procedencia_id=a.procedencia_id,
        )
    def create(self, data: Area) -> Area:
        obj = Area.objects.create(**data.__dict__)
        return self.get_by_id(obj.id)

# ---------- CATEGORIA RESIDUO ----------
class CategoriaResiduoRepositoryImpl(CategoriaResiduoRepository):
    def list_all(self, filtros: dict = {}) -> list[CategoriaResiduo]:
        queryset = CategoriaResiduo.objects.filter(**filtros)
        return [
            CategoriaResiduo(
                id=c.id,
                nombre=c.nombre,
                area_id=c.area_id,
            )
            for c in queryset
        ]

    def get_by_id(self, id: int) -> CategoriaResiduo:
        c = CategoriaResiduo.objects.get(id=id)
        return CategoriaResiduo(
            id=c.id,
            nombre=c.nombre,
            area_id=c.area_id,
        )
    def create(self, data: CategoriaResiduo) -> CategoriaResiduo:
        obj = CategoriaResiduo.objects.create(**data.__dict__)
        return self.get_by_id(obj.id)
    
    def update(self, id: int, data: CategoriaResiduo) -> CategoriaResiduo:
        CategoriaResiduo.objects.filter(id=id).update(**data.__dict__)
        return self.get_by_id(id)
    
    def delete(self, id: int) -> None:
        CategoriaResiduo.objects.filter(id=id).delete()


# ---------- RESIDUO ESPECIFCO ----------
class ResiduoEspecificoRepositoryImpl(ResiduoEspecificoRepository):
    def list_all(self, filtros: dict = {}) -> list[ResiduoEspecifico]:
        queryset = ResiduoEspecifico.objects.filter(**filtros)
        return [
            ResiduoEspecifico(
                id=r.id,
                nombre=r.nombre,
                categoria_id=r.categoria_id,
            )
            for r in queryset
        ]

    def get_by_id(self, id: int) -> ResiduoEspecifico:
        r = ResiduoEspecifico.objects.get(id=id)
        return ResiduoEspecifico(
            id=r.id,
            nombre=r.nombre,
            categoria_id=r.categoria_id,
        )
    def create(self, data: ResiduoEspecifico) -> ResiduoEspecifico:
        obj = ResiduoEspecifico.objects.create(**data.__dict__)
        return self.get_by_id(obj.id)
    
    def update(self, id: int, data: ResiduoEspecifico) -> ResiduoEspecifico:
        ResiduoEspecifico.objects.filter(id=id).update(**data.__dict__)
        return self.get_by_id(id)
    
    def delete(self, id: int) -> None:
        ResiduoEspecifico.objects.filter(id=id).delete()

# ---------- CENTRO DE COSTOS ----------
class CentroCostoRepositoryImpl(CentroCostoRepository):
    def list_all(self, filtros: dict = {}) -> list[CentroCosto]:
        queryset = CentroCosto.objects.filter(**filtros)
        return [
            CentroCosto(
                id=cc.id,
                codigo=cc.codigo,
                area_id=cc.area_id,
            )
            for cc in queryset
        ]

    def get_by_id(self, id: int) -> CentroCosto:
        cc = CentroCosto.objects.get(id=id)
        return CentroCosto(
            id=cc.id,
            codigo=cc.codigo,
            area_id=cc.area_id,
        )

    def create(self, data: CentroCosto) -> CentroCosto:
        obj = CentroCosto.objects.create(**data.__dict__)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: CentroCosto) -> CentroCosto:
        CentroCosto.objects.filter(id=id).update(**data.__dict__)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        CentroCosto.objects.filter(id=id).delete()

# ---------- ROL ADMINISTRATIVO ----------
class RolAdministrativoRepositoryImpl(RolAdministrativoRepository):
    def list_all(self, filtros: dict = {}) -> list[RolAdministrativo]:
        queryset = RolAdministrativo.objects.filter(**filtros)
        return [
            RolAdministrativo(
                id=ra.id,
                nombre=ra.nombre,
            )
            for ra in queryset
        ]

    def get_by_id(self, id: int) -> RolAdministrativo:
        ra = RolAdministrativo.objects.get(id=id)
        return RolAdministrativo(
            id=ra.id,
            nombre=ra.nombre,
        )

    def create(self, data: RolAdministrativo) -> RolAdministrativo:
        obj = RolAdministrativo.objects.create(**data.__dict__)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: RolAdministrativo) -> RolAdministrativo:
        RolAdministrativo.objects.filter(id=id).update(**data.__dict__)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        RolAdministrativo.objects.filter(id=id).delete()

# ---------- OPERARIO ----------
class OperarioRepositoryImpl(OperarioRepository):
    def list_all(self, filtros: dict = {}) -> list[Operario]:
        queryset = Operario.objects.filter(**filtros)
        return [
            Operario(
                id=o.id,
                nombre=o.nombre,
                apellido=o.apellido,
                documento=o.documento,
                area_id=o.area_id,
            )
            for o in queryset
        ]

    def get_by_id(self, id: int) -> Operario:
        o = Operario.objects.get(id=id)
        return Operario(
            id=o.id,
            nombre=o.nombre,
            apellido=o.apellido,
            documento=o.documento,
            area_id=o.area_id,
        )

    def create(self, data: Operario) -> Operario:
        obj = Operario.objects.create(**data.__dict__)
        return self.get_by_id(obj.id)

    def update(self, id: int, data: Operario) -> Operario:
        Operario.objects.filter(id=id).update(**data.__dict__)
        return self.get_by_id(id)

    def delete(self, id: int) -> None:
        Operario.objects.filter(id=id).delete()