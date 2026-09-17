# Product Backlog

Backlog del proyecto Lit Microfrontends priorizado con metodología MoSCoW.

---

## Metodología MoSCoW

| Prioridad | Definición | Criterio |
|-----------|------------|----------|
| **Must** | Requisito crítico. Sin esto el sistema no funciona | Sin esta story, el sistema no tiene valor |
| **Should** | Importante pero no crítico. Hay workaround temporal | Mejora significativa la funcionalidad |
| **Could** | Deseable. Aporta valor pero no es urgente | Se puede posponer sin afectar al usuario |
| **Won't** | Fuera de alcance esta iteración | No se implementa en esta fase |

---

## Backlog priorizado

### Must Have

| ID | Story | Horas | Dependencias |
|----|-------|-------|--------------|
| US-01 | Cargar MFE en runtime via import map | 39h | — |
| US-02 | Navegar entre MFEs sin recarga | 28h | US-01 |
| US-03 | Consumir datos de API REST | 24h | US-01 |

**Subtotal Must:** 91 horas

### Should Have

| ID | Story | Horas | Dependencias |
|----|-------|-------|--------------|
| US-04 | Comunicar MFEs via eventos | 16h | US-01 |
| US-05 | Aplicar theming consistente | 12h | US-04 |

**Subtotal Should:** 28 horas

### Could Have

| ID | Story | Horas | Dependencias |
|----|-------|-------|--------------|
| US-06 | Aislar MFEs con CSP | 10h | US-01 |

**Subtotal Could:** 10 horas

> **Criterio de estimación:** las 129h del backlog original son estimaciones gruesas por user story y no deben sumarse directamente al plan de ejecución. El plan inicial T-01 a T-28 suma 101h de tickets más 2h de buffer, es decir, 103h. La extensión posterior al POC añade T-29 a T-40: 49h, con un total ampliado de 150h de tickets y 152h incluyendo el buffer original.

### Won't Have (esta iteración)

| ID | Story | Razón |
|----|-------|-------|
| — | SSR con Declarative Shadow DOM | Requiere infraestructura server adicional |
| — | Module Federation como alternativa | El POC es con import maps puros |
| — | Integración con frameworks (React, Angular) | Enfoque en Lit 3 únicamente |

---

## Fases de implementación

### Fase 1: Core (41 horas)

**Objetivo:** Shell funcional con carga de MFEs en runtime.

| ID | Story | Horas |
|----|-------|-------|
| US-01 | Cargar MFE en runtime via import map | 39h |
| — | Buffer de imprevistos | 2h |

**Estado:** Completada. US-01 está validada; el routing de US-02 se mantiene pendiente para T-23.

**Entregable:** Shell Lit 3 que carga MFEs dinámicamente mediante import maps.

### Fase 2: Data (24 horas)

**Objetivo:** MFEs que consumen APIs reales con loading/error states.

| ID | Story | Horas |
|----|-------|-------|
| US-03 | Consumir datos de API REST | 24h |

**API externa de referencia:** DummyJSON (`https://dummyjson.com`) para todos, posts y users.

**Entregable:** Config-map funcionando, MFEs con `@lit/task`, skeleton loading, error handling y normalización de las respuestas de DummyJSON.

### Fase 3: Integración (28 horas)

**Objetivo:** Completar routing, comunicación y theming entre MFEs.

| ID | Story | Horas |
|----|-------|-------|
| US-02 | Completar navegación entre MFEs | Incluida en T-23 y T-24 |
| US-04 | Comunicar MFEs via eventos | 16h |
| US-05 | Aplicar theming consistente | 12h |

**Estado:** Completada. US-02 dispone de routing con `URLPattern`, y US-04 y US-05 están implementadas y validadas mediante T-24.

**Entregable:** Shell con routing funcional, event bus, cambio de tema global y estilos consistentes.

### Fase 4: Hardening (10 horas)

**Objetivo:** Seguridad y CSP.

| ID | Story | Horas |
|----|-------|-------|
| US-06 | Aislar MFEs con CSP | 10h |

**Estado:** Completada. T-25, T-26, T-27 y T-28 están implementados y validados.

**Entregable:** CSP estricta, validación de eventos, namespace en storage.

### Roadmap posterior al POC

| Fase | Objetivo | Tickets | Horas | Estado |
|------|----------|---------|-------|--------|
| Fase 5: Quality & Reliability | Tests automatizados y loader robusto | T-29 a T-32 | 18h | ✅ Completada |
| Fase 6: Runtime Contracts | Event bus, config y API client tipados | T-33 a T-36 | 16h | En progreso (T-33/T-34/T-35 ✅) |
| Fase 7: Production Readiness | Shell, headers, observabilidad e aislamiento | T-37 a T-40 | 15h | Pendiente |

**Extensión posterior al POC:** 49h. El total ampliado pasa a 150h de tickets y 152h incluyendo el buffer original.

---

## Cronograma estimado

```
Semana 1-2:  Fase 1 (US-01 + buffer) → 41h
Semana 3:    Fase 2 (US-03)          → 24h
Semana 4:    Fase 3 (US-02 + US-04 + US-05) → 28h
Semana 5:    Fase 4 (US-06)          → 10h
Semana 6:    Fase 5 (Quality)        → 18h
Semana 7:    Fase 6 (Contracts)      → 16h
Semana 8:    Fase 7 (Production)     → 15h
```

**Plan inicial:** 101h de tickets + 2h de buffer = **103h**.

**Extensión posterior al POC:** 49h.

**Plan ampliado:** 150h de tickets + 2h de buffer original = **152h**.

El plan ampliado representa aproximadamente 8 semanas a ritmo sostenido de 26h/semana.

Si el ritmo es más relajado (15h/semana): ~8-9 semanas.
