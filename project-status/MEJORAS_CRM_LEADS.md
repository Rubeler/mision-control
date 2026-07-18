# Propuestas de Mejora: CRM Leads (Seguimientos)

Documento para revisar en la próxima sesión sobre cómo organizar y desaturar el Kanban de Leads CRM.

---

## 🚫 El problema actual
El volumen de leads en las columnas (principalmente en **Nuevo** y **Seguimiento**) crece verticalmente de forma indefinida, haciendo que el tablero no sea práctico para saber a quién contactar cada día y provocando acumulación de tarjetas hacia abajo.

---

## 💡 Opciones de Mejora para Analizar

### 1. Sistema de "Fechas de Alerta / Próximo Contacto"
*   **Funcionamiento:** Cada lead tiene una fecha en la que se le debe contactar nuevamente.
*   **Diseño visual:**
    *   Las tarjetas que **no vencen hoy** se muestran atenuadas (en gris/semitransparente).
    *   Las tarjetas que **vencen hoy o están vencidas** se iluminan (borde rojo/amarillo) y suben al tope.
*   **Objetivo:** Enfocarse solo en los leads que requieren acción inmediata.

### 2. Regla de "Archivado Automático por Inactividad"
*   **Funcionamiento:** Limpieza programada de tarjetas inactivas.
*   **Criterio:** Si un lead pasa más de 7 días sin cambios, o pasan 48 horas desde el envío del Paso 3 (Cierre de Cupo) sin respuesta, el sistema lo mueve automáticamente a la columna **Perdido** (motivo: *"Inactivo"*).
*   **Objetivo:** Mantener el Kanban limpio y dinámico.

### 3. Vista de "Lista de Trabajo Diario" (Alternativa a Columnas)
*   **Funcionamiento:** Una pestaña adicional que cambia el diseño de tarjetas a una tabla compacta.
*   **Visualización:** Una lista ordenada por "Días desde el último contacto", mostrando:
    `Cliente | Mueble de interés | Último mensaje enviado (ej: Paso 1) | [Botón Enviar WhatsApp]`
*   **Objetivo:** Trabajar rápido estilo "checklist" en lugar de arrastrar tarjetas.

### 4. Filtros Avanzados y Buscador en Kanban
*   **Funcionamiento:** Buscador para filtrar al instante por nombre o mueble de interés, y botones de filtro por tipo de mensaje pendiente:
    *   `[Mostrar pendientes de Paso 1]`
    *   `[Mostrar pendientes de Paso 2]`
*   **Objetivo:** Reducir a voluntad la cantidad de leads mostrados en pantalla.
