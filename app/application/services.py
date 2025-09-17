"""
    Registrar los servicios de la aplicación (Ver manual de arquitecturra))
"""
from app.domain.entities import (
    Procedencia,
    Acta,
    ActaGeneracionResiduo,
    Usuario,
    GeneracionResiduo,
    Area,
    CategoriaResiduo,
    ResiduoEspecifico
)
from app.domain.repositories import (
    ProcedenciaRepository,
    ActaRepository,
    ActaGeneracionResiduoRepository,
    UsuarioRepository,
    GeneracionResiduoRepository,
    AreaRepository,
    CategoriaResiduoRepository,
    ResiduoEspecificoRepository,
)


class ProcedenciaService:
    def __init__(self, repository: ProcedenciaRepository):
        self.repository = repository

    def list_all(self, filtros: dict = {}) -> list[Procedencia]:
        return self.repository.list_all(filtros)

    def get_by_id(self, id: int) -> Procedencia:
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

    def list_all(self, filtros: dict = {}) -> list[Acta]:
        return self.repository.list_all(filtros)

    def get_by_id(self, id: int) -> Acta:
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

    def list_all(self, filtros: dict = {}) -> list[ActaGeneracionResiduo]:
        return self.repository.list_all(filtros)

    def get_by_id(self, id: int) -> ActaGeneracionResiduo:
        return self.repository.get_by_id(id)

    def create(self, data: dict) -> ActaGeneracionResiduo:
        return self.repository.create(ActaGeneracionResiduo(**data))

    def update(self, id: int, data: dict) -> ActaGeneracionResiduo:
        return self.repository.update(id, ActaGeneracionResiduo(**data))

    def delete(self, id: int) -> None:
        self.repository.delete(id)

class UsuarioService:
    def __init__(self, repository: UsuarioRepository):
        self.repository = repository

    def list_all(self, filtros: dict = {}) -> list[Usuario]:
        return self.repository.list_all(filtros)

    def get_by_id(self, id: int) -> Usuario:
        return self.repository.get_by_id(id)

    def create(self, data: dict) -> Usuario:
        return self.repository.create(Usuario(**data))

    def update(self, id: int, data: dict) -> Usuario:
        return self.repository.update(id, Usuario(**data))

    def delete(self, id: int) -> None:
        self.repository.delete(id)

class GeneracionResiduoService:
    def __init__(self, repository: GeneracionResiduoRepository):
        self.repository = repository

    def list_all(self, filtros: dict = {}) -> list[GeneracionResiduo]:
        return self.repository.list_all(filtros)

    def get_by_id(self, id: int) -> GeneracionResiduo:
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

    def list_all(self, filtros: dict = {}) -> list[Area]:
        return self.repository.list_all(filtros)

    def get_by_id(self, id: int) -> Area:
        return self.repository.get_by_id(id)

    def create(self, data: dict) -> Area:
        return self.repository.create(Area(**data))

class CategoriaResiduoService:
    def __init__(self, repository: CategoriaResiduoRepository):
        self.repository = repository

    def list_all(self, filtros: dict = {}) -> list[CategoriaResiduo]:
        return self.repository.list_all(filtros)

    def get_by_id(self, id: int) -> CategoriaResiduo:
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

    def list_all(self, filtros: dict = {}) -> list[ResiduoEspecifico]:
        return self.repository.list_all(filtros)

    def get_by_id(self, id: int) -> ResiduoEspecifico:
        return self.repository.get_by_id(id)

    def create(self, data: dict) -> ResiduoEspecifico:
        return self.repository.create(ResiduoEspecifico(**data))
    
    def update(self, id: int, data: dict) -> ResiduoEspecifico:
        return self.repository.update(id, ResiduoEspecifico(**data))
    
    def delete(self, id: int) -> None:
        self.repository.delete(id)

class CentroCostoService:
    def __init__(self, repository):
        self.repository = repository

    def list_all(self, filtros: dict = {}) -> list:
        return self.repository.list_all(filtros)

    def get_by_id(self, id: int):
        return self.repository.get_by_id(id)

    def create(self, data: dict):
        return self.repository.create(data)

class RolAdministrativoService:
    def __init__(self, repository):
        self.repository = repository

    def list_all(self, filtros: dict = {}) -> list:
        return self.repository.list_all(filtros)

    def get_by_id(self, id: int):
        return self.repository.get_by_id(id)

    def create(self, data: dict):
        return self.repository.create(data)

    def update(self, id: int, data: dict):
        return self.repository.update(id, data)

    def delete(self, id: int) -> None:
        self.repository.delete(id)

class OperarioService:
    def __init__(self, repository):
        self.repository = repository

    def list_all(self, filtros: dict = {}) -> list:
        return self.repository.list_all(filtros)

    def get_by_id(self, id: int):
        return self.repository.get_by_id(id)

    def create(self, data: dict):
        return self.repository.create(data)

    def update(self, id: int, data: dict):
        return self.repository.update(id, data)

    def delete(self, id: int) -> None:
        self.repository.delete(id)