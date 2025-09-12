from abc import ABC, abstractmethod
from typing import List
from app.domain.entities import (
    Gerencia,
    Procedencia,
    Acta,
    ActaGeneracionResiduo,
    Usuario,)

""" Ejemplo de implementación de un repositorio para el modelo Gerencia """
class GerenciaRepository(ABC):
    @abstractmethod
    def list_all(self) -> List[Gerencia]: ...
    @abstractmethod
    def get_by_id(self, id: int) -> Gerencia: ...
    @abstractmethod
    def create(self, data: Gerencia) -> Gerencia: ...
    @abstractmethod
    def update(self, id: int, data: Gerencia) -> Gerencia: ...
    @abstractmethod
    def delete(self, id: int) -> None: ...

class ProcedenciaRepository(ABC):
    @abstractmethod
    def list_all(self) -> List[Procedencia]: ...

    @abstractmethod
    def get_by_id(self, id: int) -> Procedencia: ...

    @abstractmethod
    def create(self, entity: Procedencia) -> Procedencia: ...

    @abstractmethod
    def update(self, id: int, entity: Procedencia) -> Procedencia: ...

    @abstractmethod
    def delete(self, id: int) -> None: ...

class ActaRepository(ABC):
    @abstractmethod
    def list_all(self) -> List[Acta]: ...

    @abstractmethod
    def get_by_id(self, id: int) -> Acta: ...

    @abstractmethod
    def create(self, entity: Acta) -> Acta: ...

    @abstractmethod
    def update(self, id: int, entity: Acta) -> Acta: ...

    @abstractmethod
    def delete(self, id: int) -> None: ...

class ActaGeneracionResiduoRepository(ABC):
    @abstractmethod
    def list_all(self) -> List[ActaGeneracionResiduo]: ...

    @abstractmethod
    def get_by_id(self, id: int) -> ActaGeneracionResiduo: ...

    @abstractmethod
    def create(self, entity: ActaGeneracionResiduo) -> ActaGeneracionResiduo: ...

    @abstractmethod
    def update(self, id: int, entity: ActaGeneracionResiduo) -> ActaGeneracionResiduo: ...

    @abstractmethod
    def delete(self, id: int) -> None: ...

class UsuarioRepository(ABC):
    @abstractmethod
    def list_all(self) -> List[Usuario]: ...

    @abstractmethod
    def get_by_id(self, id: int) -> Usuario: ...

    @abstractmethod
    def create(self, entity: Usuario) -> Usuario: ...

    @abstractmethod
    def update(self, id: int, entity: Usuario) -> Usuario: ...

    @abstractmethod
    def delete(self, id: int) -> None: ...
