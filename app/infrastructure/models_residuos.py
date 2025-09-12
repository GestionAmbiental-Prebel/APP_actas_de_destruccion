# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Acta(models.Model):
    numero_acta = models.CharField(unique=True)
    fecha_acta = models.TextField()  # This field type is a guess.
    area = models.ForeignKey('Area', models.DO_NOTHING)
    centro_costo = models.ForeignKey('Centrocosto', models.DO_NOTHING)
    operario_entrega = models.ForeignKey('Operario', models.DO_NOTHING)
    operario_recepcion = models.ForeignKey('Operario', models.DO_NOTHING, related_name='acta_operario_recepcion_set')
    firma_entrega = models.TextField(blank=True, null=True)
    firma_recepcion = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Acta'


class ActaGeneracionResiduo(models.Model):
    acta = models.ForeignKey(Acta, models.DO_NOTHING)
    generacion_residuo = models.ForeignKey('Generacionresiduo', models.DO_NOTHING)
    peso_reportado = models.DecimalField(max_digits=10, decimal_places=5, blank=True, null=True)  # max_digits and decimal_places have been guessed, as this database handles decimal fields as float
    peso_conciliado = models.DecimalField(max_digits=10, decimal_places=5, blank=True, null=True)  # max_digits and decimal_places have been guessed, as this database handles decimal fields as float

    class Meta:
        managed = False
        db_table = 'Acta_GeneracionResiduo'


class Area(models.Model):
    nombre = models.CharField()
    procedencia = models.ForeignKey('Procedencia', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'Area'


class Categoriaresiduo(models.Model):
    nombre = models.CharField()
    area = models.ForeignKey(Area, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'CategoriaResiduo'


class Centrocosto(models.Model):
    codigo = models.CharField()
    area = models.ForeignKey(Area, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'CentroCosto'


class GeneracionResiduo(models.Model):
    fecha = models.TextField()  # This field type is a guess.
    peso = models.DecimalField(max_digits=10, decimal_places=5)  # max_digits and decimal_places have been guessed, as this database handles decimal fields as float
    residuo = models.ForeignKey('Residuoespecifico', models.DO_NOTHING)
    operario = models.ForeignKey('Operario', models.DO_NOTHING)
    motivo = models.CharField()

    class Meta:
        managed = False
        db_table = 'GeneracionResiduo'


class Operario(models.Model):
    nombre = models.CharField()
    apellido = models.CharField()
    documento = models.BigIntegerField(unique=True)
    area = models.ForeignKey(Area, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'Operario'


class Procedencia(models.Model):
    nombre = models.CharField()
    sede = models.CharField()

    class Meta:
        managed = False
        db_table = 'Procedencia'


class Residuoespecifico(models.Model):
    nombre = models.CharField()
    categoria = models.ForeignKey(Categoriaresiduo, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'ResiduoEspecifico'


class Roladministrativo(models.Model):
    nombre = models.CharField()

    class Meta:
        managed = False
        db_table = 'RolAdministrativo'


class Usuario(models.Model):
    usernameA = models.CharField(unique=True)
    password_hash = models.CharField()
    area = models.ForeignKey(Area, models.DO_NOTHING, blank=True, null=True)
    rol_administrativo = models.ForeignKey(Roladministrativo, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        db_table = 'Usuario'
