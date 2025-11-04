from django.db import models


class Sede(models.Model):
    nombre = models.CharField(unique=True)

    class Meta:
        managed = False
        db_table = 'Sede'


class Procedencia(models.Model):
    nombre = models.CharField()
    sede = models.ForeignKey(Sede, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'Procedencia'


class Area(models.Model):
    nombre = models.CharField()
    procedencia = models.ForeignKey(Procedencia, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'Area'


class SubArea(models.Model):
    nombre = models.CharField()
    area = models.ForeignKey(Area, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'SubArea'


class CategoriaResiduo(models.Model):
    nombre = models.CharField()
    subarea = models.ForeignKey(SubArea, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'CategoriaResiduo'


class ResiduoEspecifico(models.Model):
    nombre = models.CharField()
    categoria = models.ForeignKey(CategoriaResiduo, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'ResiduoEspecifico'


class RolAdministrativo(models.Model):
    nombre = models.CharField(unique=True)

    class Meta:
        managed = False
        db_table = 'RolAdministrativo'


class Operario(models.Model):
    nombre = models.CharField()
    apellido = models.CharField(blank=True, null=True)
    documento = models.CharField(blank=True, null=True)
    subarea = models.ForeignKey(SubArea, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Operario'


class CentroCosto(models.Model):
    codigo = models.CharField()
    nombre = models.CharField(blank=True, null=True)
    clase_movimiento = models.IntegerField(blank=True, null=True)
    subarea = models.ForeignKey(SubArea, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'CentroCosto'


class Acta(models.Model):
    numero_acta = models.CharField(unique=True)
    fecha_acta = models.DateTimeField()
    subarea = models.ForeignKey(SubArea, models.DO_NOTHING)
    centro_costo = models.ForeignKey(CentroCosto, models.DO_NOTHING)
    documento_entrega = models.CharField()
    documento_recepcion = models.CharField()

    class Meta:
        managed = False
        db_table = 'Acta'


class GeneracionResiduo(models.Model):
    fecha = models.DateTimeField(blank=True, null=True)
    peso = models.TextField(blank=True, null=True)
    residuo = models.ForeignKey(ResiduoEspecifico, models.DO_NOTHING, blank=True, null=True)
    operario = models.ForeignKey(Operario, models.DO_NOTHING, blank=True, null=True)
    motivo = models.CharField(blank=True, null=True)
    motivo_otro = models.CharField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'GeneracionResiduo'


class ActaGeneracionResiduo(models.Model):
    acta = models.ForeignKey(Acta, models.DO_NOTHING)
    generacion_residuo = models.ForeignKey(GeneracionResiduo, models.DO_NOTHING)
    peso_reportado = models.TextField(blank=True, null=True)
    peso_conciliado = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Acta_GeneracionResiduo'
