from django.db import models

class GerenciaModel(models.Model):
    nombre = models.TextField(max_length=50)
    descripcion = models.TextField(max_length=100)
    image = models.TextField(max_length=255, blank=True, null=True)
    estado = models.BooleanField(default=True)

    class Meta:
        db_table = 'gerencia'

    def __str__(self):
        return self.nombre
