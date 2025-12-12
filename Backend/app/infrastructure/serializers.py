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

    # Ahora lo genera el backend → solo lectura
    numero_acta = serializers.CharField(read_only=True)

    fecha_acta = serializers.DateTimeField(required=False)  # ✅ Cambiado a required=False para PATCH
    subarea_id = serializers.IntegerField(required=False)  # ✅ Cambiado a required=False para PATCH
    centro_costo_id = serializers.IntegerField(required=False)  # ✅ Cambiado a required=False para PATCH
    documento_entrega = serializers.CharField(max_length=100, required=False)  # ✅ Cambiado

    # Esto lo sigue llenando el backend
    documento_recepcion = serializers.CharField(
        max_length=100,
        required=False, allow_blank=True, allow_null=True
    )
    fecha_conciliacion = serializers.DateTimeField(required=False, allow_null=True)

    # Estos campos siguen opcionales
    consecutivo = serializers.IntegerField(required=False, allow_null=True)
    numero_inventario = serializers.IntegerField(required=False, allow_null=True)

    def update(self, instance, validated_data):
        """
        Actualiza una instancia existente con los datos validados.
        Este método es necesario porque usamos Serializer en lugar de ModelSerializer.
        """
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class ActaGeneracionResiduoSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    acta_id = serializers.IntegerField(required=False)  # ✅ Cambiado para PATCH
    generacion_residuo_id = serializers.IntegerField(required=False)  # ✅ Cambiado para PATCH
    peso_reportado = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    peso_conciliado = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    def update(self, instance, validated_data):
        """
        Actualiza una instancia existente.
        """
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class GeneracionResiduoSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    fecha = serializers.DateTimeField(required=False)  # ✅ Cambiado para PATCH
    peso = serializers.FloatField(required=False)  # ✅ Cambiado para PATCH
    residuo_id = serializers.IntegerField(required=False)  # ✅ Cambiado para PATCH
    operario_id = serializers.IntegerField(required=False)  # ✅ Cambiado para PATCH
    motivo = serializers.CharField(max_length=255, required=False)  # ✅ Cambiado para PATCH
    motivo_otro = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    residuo_otro = serializers.CharField(max_length=150, required=False, allow_blank=True, allow_null=True)

    def update(self, instance, validated_data):
        """
        Actualiza una instancia existente.
        """
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

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

class ConciliacionSerializer(serializers.Serializer):
    documento_recepcion = serializers.CharField(required=True, max_length=100)
    residuos = serializers.ListField(child=serializers.DictField(), required=True)

    def create(self, validated_data):
        service = self.context.get("service")
        acta_id = self.context.get("acta_id")  # viene del viewset
        if not service or not acta_id:
            raise ValueError("No se inyectó el service o acta_id en el serializer.")
        return service.conciliar_acta(acta_id, **validated_data)

class NumeracionActasSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    year = serializers.IntegerField(required=True)
    ultimo_numero = serializers.IntegerField(required=True)

    def create(self, validated_data):
        """
        No se usa directamente, ya que la creación se maneja
        a través del repositorio con get_or_create_year.
        """
        raise NotImplementedError("Use el servicio para crear registros de numeración")

    def update(self, instance, validated_data):
        """
        No se permite actualización manual, ya que el incremento
        se maneja automáticamente a través de increment_and_get.
        """
        raise NotImplementedError("La numeración se actualiza automáticamente")