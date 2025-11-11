"""
Registrar los servicios de la aplicación (ver manual de arquitectura)
"""
from typing import List, Optional
from app.domain.entities import (
    Sede,
    Procedencia,
    Acta,
    ActaGeneracionResiduo,
    GeneracionResiduo,
    Area,
    CategoriaResiduo,
    ResiduoEspecifico,
    CentroCosto,
    RolAdministrativo,
    Operario,
    SubArea,
    NovedadConciliacion,
)
from app.domain.repositories import (
    SedeRepository,
    ProcedenciaRepository,
    ActaRepository,
    ActaGeneracionResiduoRepository,
    GeneracionResiduoRepository,
    AreaRepository,
    CategoriaResiduoRepository,
    ResiduoEspecificoRepository,
    CentroCostoRepository,
    RolAdministrativoRepository,
    OperarioRepository,
    SubAreaRepository,
    NovedadConciliacionRepository,
)

# =======================================
# SERVICIOS (Lógica de negocio)
# =======================================

class SedeService:
    def __init__(self, repository: SedeRepository):
        self.repository = repository

    def list_all(self) -> List[Sede]:
        return self.repository.list_all()

    def get_by_id(self, id: int) -> Optional[Sede]:
        return self.repository.get_by_id(id)

    def create(self, data: dict) -> Sede:
        return self.repository.create(Sede(**data))

    def update(self, id: int, data: dict) -> Sede:
        return self.repository.update(id, Sede(**data))

    def delete(self, id: int) -> None:
        self.repository.delete(id)

class ProcedenciaService:
    def __init__(self, repository: ProcedenciaRepository):
        self.repository = repository

    def list_all(self) -> List[Procedencia]:
        return self.repository.list_all()

    def get_by_id(self, id: int) -> Optional[Procedencia]:
        return self.repository.get_by_id(id)

    def create(self, data: dict) -> Procedencia:
        return self.repository.create(Procedencia(**data))

    def update(self, id: int, data: dict) -> Procedencia:
        return self.repository.update(id, Procedencia(**data))

    def delete(self, id: int) -> None:
        self.repository.delete(id)


class ActaService:
    def __init__(self, repository):
        self.repository = repository

    def list_all(self) -> list[Acta]:
        return self.repository.list_all()

    def get_by_id(self, id: int) -> Acta:
        return self.repository.get_by_id(id)

    def create(self, data: dict) -> Acta:
        data.pop('id', None)  # no enviamos id, Django lo asigna
        return self.repository.create(Acta(**data))

    def update(self, id: int, data: dict) -> Acta:
        return self.repository.update(id, Acta(**data))

    def delete(self, id: int) -> None:
        self.repository.delete(id)



class ActaGeneracionResiduoService:
    def __init__(self, repository: ActaGeneracionResiduoRepository):
        self.repository = repository

    def list_all(self) -> List[ActaGeneracionResiduo]:
        return self.repository.list_all()

    def get_by_id(self, id: int) -> Optional[ActaGeneracionResiduo]:
        return self.repository.get_by_id(id)

    def create(self, data: dict) -> ActaGeneracionResiduo:
        data.pop('id', None)  # Django asigna id automáticamente
        return self.repository.create(ActaGeneracionResiduo(**data))  # <--- CORRECTO

    def update(self, id: int, data: dict) -> ActaGeneracionResiduo:
        return self.repository.update(id, ActaGeneracionResiduo(**data))

    def delete(self, id: int) -> None:
        self.repository.delete(id)




class GeneracionResiduoService:
    def __init__(self, repository: GeneracionResiduoRepository):
        self.repository = repository

    def list_all(self) -> List[GeneracionResiduo]:
        return self.repository.list_all()

    def get_by_id(self, id: int) -> Optional[GeneracionResiduo]:
        return self.repository.get_by_id(id)

    def create(self, data: dict) -> GeneracionResiduo:
        return self.repository.create(GeneracionResiduo(**data))

    def update(self, id: int, data: dict) -> GeneracionResiduo:
        return self.repository.update(id, GeneracionResiduo(**data))

    def delete(self, id: int) -> None:
        self.repository.delete(id)


class AreaService:
    def __init__(self, repository: AreaRepository):
        self.repository = repository

    def list_all(self) -> List[Area]:
        return self.repository.list_all()

    def get_by_id(self, id: int) -> Optional[Area]:
        return self.repository.get_by_id(id)

    def create(self, data: dict) -> Area:
        return self.repository.create(Area(**data))


class SubAreaService:
    def __init__(self, repository: SubAreaRepository):
        self.repository = repository

    def list_all(self) -> List[SubArea]:
        return self.repository.list_all()

    def get_by_id(self, id: int) -> Optional[SubArea]:
        return self.repository.get_by_id(id)

    def create(self, data: dict) -> SubArea:
        return self.repository.create(SubArea(**data))

    def update(self, id: int, data: dict) -> SubArea:
        return self.repository.update(id, SubArea(**data))

    def delete(self, id: int) -> None:
        self.repository.delete(id)


class CategoriaResiduoService:
    def __init__(self, repository: CategoriaResiduoRepository):
        self.repository = repository

    def list_all(self) -> List[CategoriaResiduo]:
        return self.repository.list_all()

    def get_by_id(self, id: int) -> Optional[CategoriaResiduo]:
        return self.repository.get_by_id(id)

    def create(self, data: dict) -> CategoriaResiduo:
        return self.repository.create(CategoriaResiduo(**data))

    def update(self, id: int, data: dict) -> CategoriaResiduo:
        return self.repository.update(id, CategoriaResiduo(**data))

    def delete(self, id: int) -> None:
        self.repository.delete(id)


class ResiduoEspecificoService:
    def __init__(self, repository: ResiduoEspecificoRepository):
        self.repository = repository

    def list_all(self) -> List[ResiduoEspecifico]:
        return self.repository.list_all()

    def get_by_id(self, id: int) -> Optional[ResiduoEspecifico]:
        return self.repository.get_by_id(id)

    def create(self, data: dict) -> ResiduoEspecifico:
        return self.repository.create(ResiduoEspecifico(**data))

    def update(self, id: int, data: dict) -> ResiduoEspecifico:
        return self.repository.update(id, ResiduoEspecifico(**data))

    def delete(self, id: int) -> None:
        self.repository.delete(id)


class CentroCostoService:
    def __init__(self, repository: CentroCostoRepository):
        self.repository = repository

    def list_all(self) -> List[CentroCosto]:
        return self.repository.list_all()

    def get_by_id(self, id: int) -> Optional[CentroCosto]:
        return self.repository.get_by_id(id)

    def create(self, data: dict) -> CentroCosto:
        return self.repository.create(CentroCosto(**data))

    def update(self, id: int, data: dict) -> CentroCosto:
        return self.repository.update(id, CentroCosto(**data))

    def delete(self, id: int) -> None:
        self.repository.delete(id)


class RolAdministrativoService:
    def __init__(self, repository: RolAdministrativoRepository):
        self.repository = repository

    def list_all(self) -> List[RolAdministrativo]:
        return self.repository.list_all()

    def get_by_id(self, id: int) -> Optional[RolAdministrativo]:
        return self.repository.get_by_id(id)

    def create(self, data: dict) -> RolAdministrativo:
        return self.repository.create(RolAdministrativo(**data))

    def update(self, id: int, data: dict) -> RolAdministrativo:
        return self.repository.update(id, RolAdministrativo(**data))

    def delete(self, id: int) -> None:
        self.repository.delete(id)


class OperarioService:
    def __init__(self, repository: OperarioRepository):
        self.repository = repository

    def list_all(self) -> list[Operario]:
        return self.repository.list_all()

    def get_by_id(self, id: int) -> Optional[Operario]:
        return self.repository.get_by_id(id)

    def create(self, data: dict) -> Operario:
        """
        Crea un operario. Se asegura de que 'id' no se pase
        y que 'subarea_id' esté presente.
        """
        data = data.copy()
        data.pop('id', None)  

        if 'subarea_id' not in data:
            raise ValueError("subarea_id es obligatorio para crear un Operario")

        operario_entity = Operario(**data)
        return self.repository.create(operario_entity)

    def update(self, id: int, data: dict) -> Operario:
        """
        Actualiza un operario existente. Permite cambiar la subarea si se pasa.
        """
        data = data.copy()
        data.pop('id', None)  

        operario_entity = Operario(**data)
        return self.repository.update(id, operario_entity)

    def delete(self, id: int) -> None:
        self.repository.delete(id)


class NovedadConciliacionService:
    def __init__(self, repository: NovedadConciliacionRepository):
        self.repository = repository

    def list_all(self, filtros: dict = {}) -> List[NovedadConciliacion]:
        """Lista todas las novedades de conciliación (puede filtrar por campos)."""
        try:
            return self.repository.list_all(filtros)
        except Exception as e:
            raise ValueError(f"Error al listar novedades: {str(e)}")

    def get_by_id(self, id: int) -> Optional[NovedadConciliacion]:
        """Obtiene una novedad por su ID."""
        try:
            return self.repository.get_by_id(id)
        except ValueError as e:
            raise e
        except Exception as e:
            raise ValueError(f"Error al obtener la novedad con id {id}: {str(e)}")

    def create(self, data: dict) -> NovedadConciliacion:
        """Crea una nueva novedad asociada a un acta de generación de residuo."""
        try:
            entity = NovedadConciliacion(**data)
            return self.repository.create(entity)
        except ValueError as e:
            raise e
        except Exception as e:
            raise ValueError(f"Error al crear la novedad: {str(e)}")

    def update(self, id: int, data: dict) -> NovedadConciliacion:
        """Actualiza una novedad existente."""
        try:
            entity = NovedadConciliacion(**data)
            return self.repository.update(id, entity)
        except ValueError as e:
            raise e
        except Exception as e:
            raise ValueError(f"Error al actualizar la novedad con id {id}: {str(e)}")

    def delete(self, id: int) -> None:
        """Elimina una novedad existente."""
        try:
            self.repository.delete(id)
        except ValueError as e:
            raise e
        except Exception as e:
            raise ValueError(f"Error al eliminar la novedad con id {id}: {str(e)}")