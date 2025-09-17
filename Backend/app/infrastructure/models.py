from django.db import models
from django.contrib.auth.models import AbstractUser


class Procedencia(models.Model):
    SEDE_CHOICES = [
        ("Productora", "Productora"),
        ("Comercial", "Comercial"),
        ("RioNegro", "RioNegro"),
    ]
    nombre = models.CharField(max_length=100)
    sede = models.CharField(max_length=20, choices=SEDE_CHOICES)

    class Meta:
        db_table = "Procedencia"

    def __str__(self):
        return f"{self.nombre} ({self.sede})"


class Area(models.Model):
    nombre = models.CharField(max_length=100)
    procedencia = models.ForeignKey(Procedencia, on_delete=models.CASCADE)

    class Meta:
        db_table = "Area"

    def __str__(self):
        return self.nombre


class CategoriaResiduo(models.Model):
    nombre = models.CharField(max_length=100)
    area = models.ForeignKey(Area, on_delete=models.CASCADE)

    class Meta:
        db_table = "CategoriaResiduo"

    def __str__(self):
        return self.nombre


class ResiduoEspecifico(models.Model):
    nombre = models.CharField(max_length=100)
    categoria = models.ForeignKey(CategoriaResiduo, on_delete=models.CASCADE)

    class Meta:
        db_table = "ResiduoEspecifico"

    def __str__(self):
        return self.nombre


class Operario(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    documento = models.CharField(max_length=50, unique=True)
    area = models.ForeignKey(Area, on_delete=models.CASCADE)

    class Meta:
        db_table = "Operario"

    def __str__(self):
        return f"{self.nombre} {self.apellido}"


class GeneracionResiduo(models.Model):
    MOTIVO_CHOICES = [
        ("Averia", "Avería"),
        ("Bloqueado", "Bloqueado"),
        ("Incidente", "Incidente"),
        ("Obsoleto", "Obsoleto"),
        ("Rechazo", "Rechazo"),
        ("Vencido", "Vencido"),
    ]
    fecha = models.DateTimeField()
    peso = models.FloatField()
    residuo = models.ForeignKey(ResiduoEspecifico, on_delete=models.CASCADE)
    operario = models.ForeignKey(Operario, on_delete=models.CASCADE)
    motivo = models.CharField(max_length=20, choices=MOTIVO_CHOICES, blank=True, null=True)

    class Meta:
        db_table = "GeneracionResiduo"


class CentroCosto(models.Model):
    codigo = models.CharField(max_length=50)
    area = models.ForeignKey(Area, on_delete=models.CASCADE)

    class Meta:
        db_table = "CentroCosto"

    def __str__(self):
        return self.codigo


class RolAdministrativo(models.Model):
    ROL_CHOICES = [
        ("Gestión Ambiental", "Gestión Ambiental"),
        ("Punto Verde", "Punto Verde"),
    ]
    nombre = models.CharField(max_length=50, choices=ROL_CHOICES)

    class Meta:
        db_table = "RolAdministrativo"

    def __str__(self):
        return self.nombre


class Usuario(AbstractUser):
    area = models.ForeignKey(Area, on_delete=models.SET_NULL, null=True, blank=True)
    rol_administrativo = models.ForeignKey(
        RolAdministrativo, on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        db_table = "Usuario"


class Acta(models.Model):
    numero_acta = models.CharField(max_length=50, unique=True)
    fecha_acta = models.DateTimeField()
    area = models.ForeignKey(Area, on_delete=models.CASCADE)
    centro_costo = models.ForeignKey(CentroCosto, on_delete=models.CASCADE)
    operario_entrega = models.ForeignKey(
        Operario, related_name="actas_entregadas", on_delete=models.CASCADE
    )
    operario_recepcion = models.ForeignKey(
        Operario, related_name="actas_recibidas", on_delete=models.CASCADE
    )
    firma_entrega = models.TextField()
    firma_recepcion = models.TextField()

    class Meta:
        db_table = "Acta"


class ActaGeneracionResiduo(models.Model):
    acta = models.ForeignKey(Acta, on_delete=models.CASCADE)
    generacion_residuo = models.ForeignKey(GeneracionResiduo, on_delete=models.CASCADE)
    peso_reportado = models.FloatField()
    peso_conciliado = models.FloatField()

    class Meta:
        db_table = "Acta_GeneracionResiduo"
