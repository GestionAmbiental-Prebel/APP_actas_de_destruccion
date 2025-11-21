from django.db import models


class Sede(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'Sede'

    def __str__(self):
        return self.nombre


class Procedencia(models.Model):
    nombre = models.CharField(max_length=100)
    sede = models.ForeignKey(Sede, on_delete=models.PROTECT)

    class Meta:
        db_table = 'Procedencia'

    def __str__(self):
        return f"{self.nombre} ({self.sede})"


class Area(models.Model):
    nombre = models.CharField(max_length=100)
    procedencia = models.ForeignKey(Procedencia, on_delete=models.PROTECT)

    class Meta:
        db_table = 'Area'

    def __str__(self):
        return f"{self.nombre} ({self.procedencia})"


class SubArea(models.Model):
    nombre = models.CharField(max_length=100)
    area = models.ForeignKey(Area, on_delete=models.PROTECT)

    class Meta:
        db_table = 'SubArea'

    def __str__(self):
        return f"{self.nombre} ({self.area})"


class CategoriaResiduo(models.Model):
    nombre = models.CharField(max_length=100)
    subarea = models.ForeignKey(SubArea, on_delete=models.PROTECT)

    class Meta:
        db_table = 'CategoriaResiduo'

    def __str__(self):
        return self.nombre


class ResiduoEspecifico(models.Model):
    nombre = models.CharField(max_length=100)
    categoria = models.ForeignKey(CategoriaResiduo, on_delete=models.PROTECT)

    class Meta:
        db_table = 'ResiduoEspecifico'

    def __str__(self):
        return self.nombre


class RolAdministrativo(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'RolAdministrativo'

    def __str__(self):
        return self.nombre


class Operario(models.Model):
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    documento = models.CharField(max_length=20)
    subarea = models.ForeignKey(SubArea, on_delete=models.PROTECT)

    class Meta:
        db_table = 'Operario'

    def __str__(self):
        return f"{self.nombre} {self.apellido}"


class CentroCosto(models.Model):
    codigo = models.CharField(max_length=50)
    nombre = models.CharField(max_length=100, blank=True, null=True)
    clase_movimiento = models.IntegerField(blank=True, null=True)
    subarea = models.ForeignKey(SubArea, on_delete=models.PROTECT)

    class Meta:
        db_table = 'CentroCosto'

    def __str__(self):
        return f"{self.codigo} - {self.nombre}" if self.nombre else self.codigo


class Acta(models.Model):
    numero_acta = models.CharField(max_length=50, unique=True)
    fecha_acta = models.DateTimeField()
    subarea = models.ForeignKey(SubArea, on_delete=models.PROTECT)
    centro_costo = models.ForeignKey(CentroCosto, on_delete=models.PROTECT)
    documento_entrega = models.CharField(max_length=20)
    documento_recepcion = models.CharField(max_length=20)
    fecha_conciliacion = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'Acta'

    def __str__(self):
        return self.numero_acta


class GeneracionResiduo(models.Model):
    fecha = models.DateTimeField()
    peso = models.DecimalField(max_digits=10, decimal_places=2)
    residuo = models.ForeignKey(ResiduoEspecifico, on_delete=models.PROTECT)
    operario = models.ForeignKey(Operario, on_delete=models.PROTECT)
    motivo = models.CharField(max_length=200)
    motivo_otro = models.CharField(max_length=200)
    residuo_otro = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        db_table = 'GeneracionResiduo'

    def __str__(self):
        if self.residuo:
            return f"{self.residuo} - {self.peso} kg"
        return f"Otro residuo: {self.residuo_otro} - {self.peso} kg"


class ActaGeneracionResiduo(models.Model):
    acta = models.ForeignKey(Acta, on_delete=models.CASCADE)
    generacion_residuo = models.ForeignKey(GeneracionResiduo, on_delete=models.CASCADE)
    peso_reportado = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    peso_conciliado = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    class Meta:
        db_table = 'Acta_GeneracionResiduo'

    def __str__(self):
        return f"Acta {self.acta.numero_acta} - {self.generacion_residuo.residuo}"


class NovedadConciliacion(models.Model):
    acta_generacion_residuo = models.ForeignKey(
        ActaGeneracionResiduo,
        on_delete=models.CASCADE,
        related_name='novedades'
    )
    descripcion = models.CharField(max_length=200)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'NovedadConciliacion'

    def __str__(self):
        return f"Novedad en {self.acta_generacion_residuo.id}: {self.descripcion[:40]}"
