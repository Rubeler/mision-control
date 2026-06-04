# Misión Control — Sistema de Ventas y Onboarding
**Versión:** 1.0 · **Fecha:** 04/06/2026

---

## Precios propuestos (a revisar con análisis de mercado)

| Plan | Instalación (USD) | Mensualidad (ARS) | Para quién |
|------|------------------|-------------------|------------|
| **Básico** | USD 100 | $15.000 / mes | Mueblería chica, arranca a organizar |
| **Pro** | USD 200 | $25.000 / mes | Mueblería mediana, quiere control total |
| **Premium** | USD 350 | $45.000 / mes | Mueblería activa en WhatsApp, quiere leads automáticos |

**Lógica de los precios:**
- La instalación cubre tu tiempo de trabajo (2-4 horas según el plan)
- La mensualidad cubre hosting (Vercel + Supabase gratuitos por ahora), soporte y actualizaciones
- Si la app mejora, los clientes nuevos pagan más — los existentes se respetan o se actualizan con aviso

---

## Proceso de venta — paso a paso

### FASE 1: Contacto y calificación
1. El cliente consulta (WhatsApp, Instagram, referido)
2. Preguntás:
   - ¿Cuántas ventas registran por mes aprox?
   - ¿Tienen WhatsApp de negocio o personal?
   - ¿Usan algún sistema ahora (Excel, papel, nada)?
3. Según las respuestas ofrecés el plan que corresponde

### FASE 2: Demo y cierre
1. Le mostrás la app en vivo (`mision-control-omega.vercel.app`)
2. Le explicás los 3 planes
3. Acuerdo verbal → pasás al cobro

### FASE 3: Cobro
- Instalación: cobrar ANTES de arrancar el trabajo (transferencia, Mercado Pago, etc.)
- Mensualidad: cobrar el primer pago al entregar la app funcionando
- Mensualidades siguientes: el día X de cada mes (acordar con el cliente)

### FASE 4: Instalación (tu trabajo técnico)
→ Seguir la guía completa en `Stack y desarrollo para vender.md`
- Crear Supabase nuevo para ese cliente
- Clonar repo y personalizar (nombre, colores si el plan lo incluye)
- Deploy en Vercel con URL propia
- Cargar datos iniciales del cliente (productos, gastos fijos)
- Si es Premium: configurar WhatsApp bot

### FASE 5: Entrega
→ Ver checklist de entrega abajo

### FASE 6: Soporte y mensualidad
- Avisás el día de vencimiento
- Si hay dudas o problemas: atendés por WhatsApp
- Si hay actualizaciones de la app: las aplicás y avisás

---

## Checklist de instalación por plan

### Plan Básico — ~2 horas de trabajo

**Datos a pedir al cliente:**
- [ ] Nombre del negocio
- [ ] Nombre del dueño
- [ ] Gmail para crear cuenta Supabase y Vercel
- [ ] Lista de productos (nombre, costo, precio venta) — puede ser Excel o lista escrita
- [ ] Lista de gastos fijos mensuales (alquiler, servicios, sueldos, etc.)

**Pasos técnicos:**
- [ ] Crear proyecto Supabase (nuevo)
- [ ] Ejecutar SQL de las 4 tablas
- [ ] Clonar repo y cambiar nombre/dueño
- [ ] Configurar login con email del cliente (Supabase Auth)
- [ ] Deploy en Vercel con env vars
- [ ] Cargar productos en la app
- [ ] Cargar gastos fijos en la app
- [ ] Verificar que el login funciona
- [ ] Entregar URL + credenciales

---

### Plan Pro — ~3 horas de trabajo

**Todo lo del Básico más:**
- [ ] Confirmar hasta 3 emails de usuarios
- [ ] Verificar que Director OS muestra datos correctos
- [ ] Probar selector de mes con datos cargados
- [ ] Mostrar Guiones de venta y cómo usarlos

---

### Plan Premium — ~4-5 horas de trabajo

**Todo lo del Pro más:**
- [ ] Confirmar número de WhatsApp del negocio (debe ser número DEDICADO, no personal)
- [ ] Crear app en Meta Developers con el Facebook del cliente
- [ ] Configurar webhook en Vercel
- [ ] Generar token permanente de WhatsApp
- [ ] Verificar que los mensajes crean leads automáticamente
- [ ] Probar respuesta automática

---

## Checklist de entrega al cliente

Al finalizar la instalación, entregar por escrito (WhatsApp o email):

```
✅ Tu app Misión Control está lista

🌐 URL: https://[nombre].vercel.app
📧 Usuario: [email del cliente]
🔑 Contraseña: [la que configuraron]

📋 Lo que ya está cargado:
- [X] productos en tu catálogo
- [X] gastos fijos del mes

📅 Próximo pago: el [día] de cada mes — $[monto] ARS

📞 Soporte: escribime por WhatsApp ante cualquier duda
```

---

## Gestión de mensualidades

### Sistema simple (sin plataforma de cobro):
- Anotás en una planilla: cliente, plan, día de cobro, monto
- El día X del mes mandás un WhatsApp recordando el pago
- Si no paga en 5 días: segundo aviso
- Si no paga en 15 días: podés pausar el acceso (cambiar contraseña)

### A futuro (cuando tengas más clientes):
- Usar Mercado Pago suscripciones (cobro automático)
- O facturación automática por email

---

## Política de actualizaciones

- Las actualizaciones de la app se aplican automáticamente vía GitHub → Vercel
- Los clientes reciben mejoras sin costo adicional (está incluido en la mensualidad)
- Si se agrega una función mayor nueva (ej: módulo nuevo), podés ofrecer upgrade de plan

---

## Política de cancelación

- El cliente puede cancelar con 30 días de aviso
- No se devuelve la instalación (es trabajo ya realizado)
- Al cancelar: se desactiva el acceso, los datos quedan en Supabase 30 días por si quieren reactivar

---

## Tiempo estimado de trabajo por plan

| Plan | Instalación | Soporte mensual estimado |
|------|------------|-------------------------|
| Básico | ~2 horas | ~30 min/mes |
| Pro | ~3 horas | ~45 min/mes |
| Premium | ~4-5 horas | ~1 hora/mes |

---

## Próximo análisis a hacer

- [ ] Investigar competencia: ¿qué cobran sistemas similares en Argentina?
- [ ] Buscar: "CRM para mueblerías Argentina", "sistema de gestión mueblería", "software ventas carpintería"
- [ ] Comparar con herramientas genéricas: Pipedrive, HubSpot, Odoo (precios en ARS)
- [ ] Ajustar precios según el análisis
