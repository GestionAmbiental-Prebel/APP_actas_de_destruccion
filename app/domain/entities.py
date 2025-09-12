from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class Gerencia:
    id: Optional[int]
    nombre: str
    descripcion: str
    image: Optional[str]
    estado: bool

@dataclass
class Procedencia:
    id:int | None
    nombre: str
    sede : str

@dataclass
class Acta:
    id: int | None
    numero_acta: str
    fecha_acta: str
    area_id: int
    centro_costo_id: int
    operario_entrega_id: int
    operario_recepcion_id: int
    firma_entrega: str | None = None
    firma_recepcion: str | None = None

@dataclass
class ActaGeneracionResiduo:
    id: int | None
    acta_id: int
    generacion_residuo_id: int
    peso_reportado: float | None = None
    peso_conciliado: float | None = None

@dataclass
class Usuario:
    id: int | None
    usernameA: str
    password_hash: str
    area_id: int | None = None
    rol_administrativo_id: int | None = None