from rest_framework import serializers

class GerenciaSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    nombre = serializers.CharField(max_length=50)
    descripcion = serializers.CharField(max_length=100)
    image = serializers.CharField(max_length=255, required=False, allow_null=True, allow_blank=True)
    estado = serializers.BooleanField()

class ProcedenciaSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    nombre = serializers.CharField(max_length=100)
    sede = serializers.CharField(max_length=20)


class ActaSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    numero_acta = serializers.CharField(max_length=50)
    fecha_acta = serializers.CharField(max_length=50)
    area_id = serializers.IntegerField()
    centro_costo_id = serializers.IntegerField()
    operario_entrega_id = serializers.IntegerField()
    operario_recepcion_id = serializers.IntegerField()
    firma_entrega = serializers.CharField(max_length=255, required=False, allow_null=True, allow_blank=True)
    firma_recepcion = serializers.CharField(max_length=255, required=False, allow_null=True, allow_blank=True)


class ActaGeneracionResiduoSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    acta_id = serializers.IntegerField()
    generacion_residuo_id = serializers.IntegerField()
    peso_reportado = serializers.DecimalField(max_digits=10, decimal_places=5, required=False, allow_null=True)
    peso_conciliado = serializers.DecimalField(max_digits=10, decimal_places=5, required=False, allow_null=True)

class UsuarioSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    usernameA = serializers.CharField(max_length=150)
    password_hash = serializers.CharField(max_length=255)
    area_id = serializers.IntegerField(required=False, allow_null=True)
    rol_administrativo_id = serializers.IntegerField(required=False, allow_null=True)

class GeneracionResiduoSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    fecha = serializers.CharField(max_length=50)
    peso = serializers.DecimalField(max_digits=10, decimal_places=5)
    residuo_id = serializers.IntegerField()
    operario_id = serializers.IntegerField()
    motivo = serializers.CharField(max_length=255, required=False, allow_null=True, allow_blank=True)

class AreaSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    nombre = serializers.CharField(max_length=100)
    procedencia_id = serializers.IntegerField()

class CategoriaResiduoSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    nombre = serializers.CharField(max_length=100)
    descripcion = serializers.CharField(max_length=255, required=False, allow_null=True, allow_blank=True)