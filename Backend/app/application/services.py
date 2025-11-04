"""
Registrar los servicios de la aplicación (ver manual de arquitectura)
"""
from typing import List, Optional
from app.domain.entities import (
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
)
from app.domain.repositories import (
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
)

# =======================================
# SERVICIOS (Lógica de negocio)
# =======================================

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
    def __init__(self, repository: ActaRepository):
        self.repository = repository

    def list_all(self) -> List[Acta]:
        return self.repository.list_all()

    def get_by_id(self, id: int) -> Optional[Acta]:
        return self.repository.get_by_id(id)

    def create(self, data: dict) -> Acta:
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
        return self.repository.create(ActaGeneracionResiduo(**data))

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

    def list_all(self) -> List[Operario]:
        return self.repository.list_all()

    def get_by_id(self, id: int) -> Optional[Operario]:
        return self.repository.get_by_id(id)

    def create(self, data: dict) -> Operario:
        return self.repository.create(Operario(**data))

    def update(self, id: int, data: dict) -> Operario:
        return self.repository.update(id, Operario(**data))

    def delete(self, id: int) -> None:
        self.repository.delete(id)
