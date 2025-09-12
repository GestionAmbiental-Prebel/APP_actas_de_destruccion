"""
    Registrar los servicios de la aplicación (Ver manual de arquitecturra))
"""
from app.domain.entities import (
    Gerencia,
    Procedencia,
    Acta,
    ActaGeneracionResiduo,
    Usuario,
    GeneracionResiduo,
    Area,
    CategoriaResiduo,
)
from app.domain.repositories import (
    GerenciaRepository,
    ProcedenciaRepository,
    ActaRepository,
    ActaGeneracionResiduoRepository,
    UsuarioRepository,
    GeneracionResiduoRepository,
    AreaRepository,
    CategoriaResiduoRepository,
)

class GerenciaService:
    def __init__(self, repository: GerenciaRepository):
        self.repository = repository

    def list_all(self, filtros: dict = {}) -> list[Gerencia]:
        return self.repository.list_all(filtros)

    def get_by_id(self, id: int) -> Gerencia:
        return self.repository.get_by_id(id)

    def create(self, data: dict) -> Gerencia:
        return self.repository.create(Gerencia(**data))

    def update(self, id: int, data: dict) -> Gerencia:
        return self.repository.update(id, Gerencia(**data))

    def delete(self, id: int) -> None:
        self.repository.delete(id)

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