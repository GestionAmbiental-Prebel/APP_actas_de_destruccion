from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Sede:
    id: Optional[int]
    nombre: str


@dataclass
class Procedencia:
    id: Optional[int]
    nombre: str
    sede_id: int


@dataclass
class Area:
    id: Optional[int]
    nombre: str
    procedencia_id: int


@dataclass
class SubArea:
    id: Optional[int]
    nombre: str
    area_id: int


@dataclass
class CategoriaResiduo:
    id: Optional[int]
    nombre: str
    subarea_id: int


@dataclass
class ResiduoEspecifico:
    id: Optional[int]
    nombre: str
    categoria_id: int


@dataclass
class Operario:
    id: Optional[int]
    nombre: str
    apellido: Optional[str]
    documento: Optional[str]
    subarea_id: Optional[int]


@dataclass
class CentroCosto:
    id: Optional[int]
    codigo: str
    nombre: Optional[str]
    clase_movimiento: Optional[int]
    subarea_id: Optional[int]


@dataclass
class RolAdministrativo:
    id: Optional[int]
    nombre: str


@dataclass
class GeneracionResiduo:
    id: Optional[int]
    fecha: Optional[datetime]
    peso: Optional[float]
    residuo_id: Optional[int]
    operario_id: Optional[int]
    motivo: Optional[str] = None
    motivo_otro: Optional[str] = None


@dataclass
class Acta:
    id: Optional[int]
    numero_acta: str
    fecha_acta: datetime
    subarea_id: int
    centro_costo_id: int
    documento_entrega: str
    documento_recepcion: str


@dataclass
class ActaGeneracionResiduo:
    id: Optional[int]
    acta_id: int
    generacion_residuo_id: int
    peso_reportado: Optional[float] = None
    peso_conciliado: Optional[float] = None

@dataclass
class NovedadConciliacion:
    id: int
    acta_generacion_residuo_id: int
    descripcion: str
    fecha: datetime



