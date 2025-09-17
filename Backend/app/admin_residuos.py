from django.contrib import admin
from app.infrastructure.models_residuos import Procedencia, Area, Generacionresiduo

@admin.register(Procedencia)
class ProcedenciaAdmin(admin.ModelAdmin):
    list_display = ("nombre", "sede")
