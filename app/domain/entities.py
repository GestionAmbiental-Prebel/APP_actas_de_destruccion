from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class Procedencia:
    id: int | None
    nombre: str
    sede: str

@dataclass
class Area:
    id: int | None
    nombre: str
    procedencia_id: int

@dataclass
class CategoriaResiduo:
    id: int | None
    nombre: str
    area_id: int

@dataclass
class ResiduoEspecifico:
    id: int | None
    nombre: str
    categoria_id: int

@dataclass
class Operario:
    id: int | None
    nombre: str
    apellido: str
    documento: str
    area_id: int

@dataclass
class GeneracionResiduo:
    id: int | None
    fecha: datetime
    peso: float
    residuo_id: int
    operario_id: int
    motivo: str | None = None

@dataclass
class CentroCosto:
    id: int | None
    codigo: str
    area_id: int

@dataclass
class RolAdministrativo:
    id: int | None
    nombre: str

@dataclass
class Usuario:
    id: int | None
    username: str
    password: str
    area_id: int | None = None
    rol_administrativo_id: int | None = None

@dataclass
class Acta:
    id: int | None
    numero_acta: str
    fecha_acta: datetime
    area_id: int
    centro_costo_id: int
    operario_entrega_id: int
    operario_recepcion_id: int
    firma_entrega: str
    firma_recepcion: str

@dataclass
class ActaGeneracionResiduo:
    id: int | None
    acta_id: int
    generacion_residuo_id: int
    peso_reportado: float
    peso_conciliado: float