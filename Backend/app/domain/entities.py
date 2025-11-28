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
    nombre: str
    apellido: str
    documento: str
    subarea_id: int
    id: Optional[int] = None


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
    fecha: datetime
    peso: float
    residuo_id: int
    operario_id: int
    motivo: str
    motivo_otro: Optional [str] = None
    residuo_otro: Optional [str] = None
    id: Optional [int] = None


@dataclass
class Acta:
    numero_acta: str
    fecha_acta: datetime
    subarea_id: int
    centro_costo_id: int
    documento_entrega: str
    documento_recepcion: str = ''
    fecha_conciliacion: Optional[datetime] = None
    consecutivo: Optional[int] = None
    numero_inventario: Optional[int] = None
    id: Optional[int] = None

  
@dataclass
class ActaGeneracionResiduo:
    acta_id: int
    generacion_residuo_id: int
    peso_reportado: float
    peso_conciliado: Optional[float] = None  # <- opcional
    id: Optional[int] = None

@dataclass
class NovedadConciliacion:
    id: int
    acta_generacion_residuo_id: int
    descripcion: str
    fecha: datetime

@dataclass
class NumeracionActas:
    year: int
    ultimo_numero: int
    id: Optional[int] = None


