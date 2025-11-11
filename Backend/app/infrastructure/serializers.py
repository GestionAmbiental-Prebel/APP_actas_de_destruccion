from rest_framework import serializers

class SedeSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    nombre = serializers.CharField(max_length=100)

class ProcedenciaSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    nombre = serializers.CharField(max_length=100)
    sede_id = serializers.IntegerField()


class ActaSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    numero_acta = serializers.CharField(max_length=50)
    fecha_acta = serializers.DateTimeField()
    subarea_id = serializers.IntegerField()
    centro_costo_id = serializers.IntegerField()
    documento_entrega = serializers.CharField(max_length=100)
    documento_recepcion = serializers.CharField(max_length=100)


class ActaGeneracionResiduoSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    acta_id = serializers.IntegerField()
    generacion_residuo_id = serializers.IntegerField()
    peso_reportado = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    peso_conciliado = serializers.CharField(required=False, allow_null=True, allow_blank=True)


class GeneracionResiduoSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    fecha = serializers.DateTimeField(required=False, allow_null=True)
    peso = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    residuo_id = serializers.IntegerField(required=False, allow_null=True)
    operario_id = serializers.IntegerField(required=False, allow_null=True)
    motivo = serializers.CharField(max_length=255, required=False, allow_null=True, allow_blank=True)
    motivo_otro = serializers.CharField(max_length=255, required=False, allow_null=True, allow_blank=True)


class AreaSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    nombre = serializers.CharField(max_length=100)
    procedencia_id = serializers.IntegerField()


class CategoriaResiduoSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    nombre = serializers.CharField(max_length=100)
    subarea_id = serializers.IntegerField()


class ResiduoEspecificoSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    nombre = serializers.CharField(max_length=100)
    categoria_id = serializers.IntegerField()


class CentroCostoSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    codigo = serializers.CharField(max_length=50)
    nombre = serializers.CharField(max_length=100, required=False, allow_null=True)
    clase_movimiento = serializers.IntegerField(required=False, allow_null=True)
    subarea_id = serializers.IntegerField(required=False, allow_null=True)


class RolAdministrativoSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    nombre = serializers.CharField(max_length=100)


class OperarioSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    nombre = serializers.CharField(max_length=100, required=True)
    apellido = serializers.CharField(max_length=100, required=True)
    documento = serializers.CharField(max_length=50, required=True)
    subarea_id = serializers.IntegerField(required=True)

class SubAreaSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    nombre = serializers.CharField()
    area_id = serializers.IntegerField()

class NovedadConciliacionSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    acta_generacion_residuo_id = serializers.IntegerField(required=True)
    descripcion = serializers.CharField(required=True, max_length=255)
    fecha = serializers.DateTimeField(required=True)

    def create(self, validated_data):
        """
        Llama al servicio para crear una novedad.
        """
        service = self.context.get("service")
        if not service:
            raise ValueError("El servicio no fue inyectado en el contexto del serializer")

        return service.create(validated_data)

    def update(self, instance, validated_data):
        """
        Llama al servicio para actualizar una novedad.
        """
        service = self.context.get("service")
        if not service:
            raise ValueError("El servicio no fue inyectado en el contexto del serializer")

        return service.update(instance.id, validated_data)