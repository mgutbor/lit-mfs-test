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

> **Criterio de estimación:** las 129h del backlog son estimaciones gruesas por user story y no deben sumarse directamente al plan de ejecución, porque varias tareas se comparten entre stories. El plan operativo usa el desglose de T-01 a T-28: 101h de tickets más 2h de buffer, es decir, 103h planificadas.

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

---

## Prompt utilizado

### Prompt 1 (básico):

```
Genera un product backlog priorizado con MoSCoW para un proyecto de microfrontends 
con Lit 3 e import maps. Las user stories están en 08-user-stories.md.
```

**Resultado:** Backlog genérico sin detallar dependencias ni fases.

### Prompt 2 (con contexto):

```
Basándote en la documentación técnica de docs/01-07 y las user stories de 
docs/08-user-stories.md, genera un product backlog priorizado con MoSCoW. 
Incluye: dependencias entre stories, estimación de horas, fases de implementación 
y un cronograma estimado. El proyecto es un POC de microfrontends con Lit 3 
e import maps nativos.
```

**Resultado:** Backlog más completo pero sin razón de la priorización.

### Prompt 3 (el más efectivo):

```
Eres un Product Owner técnico. Analiza la documentación del proyecto 
en docs/01-07 y las user stories en docs/08-user-stories.md.

Tarea: Genera un product backlog priorizado con MoSCoW que incluya:
1. Matriz de priorización con justificación de cada categoría
2. Backlog ordenado con dependencias y estimaciones
3. Fases de implementación (máximo 4 fases)
4. Historial de prompts utilizados y por qué este fue el mejor

Contexto: Es un POC para demostrar arquitectura de microfrontends 
con Lit 3 e import maps. El equipo tiene experiencia en frontend 
pero no en microfrontends. Presupuesto: 129 horas totales.
```

**Resultado:** Backlog completo con justificaciones, fases coherentes y cronograma realista.

### ¿Por qué el Prompt 3 fue el más efectivo?

1. **Define el rol:** "Eres un Product Owner técnico" → sitúa al LLM en un contexto específico
2. **Ancla las fuentes:** "Analiza la documentación en docs/" → obliga a leer los archivos existentes
3. **Especifica el formato de salida:** Lista numerada con estructura concreta
4. **Incluye contexto del proyecto:** POC, equipo, presupuesto → permite decisiones informadas
5. **Pide metadatos:** "Historial de prompts" → reflexión sobre el proceso

**Conclusión:** Los prompts más efectivos son los que combinan **rol + fuentes + formato + contexto + restricciones**.

---

## Cronograma estimado

```
Semana 1-2:  Fase 1 (US-01 + buffer) → 41h
Semana 3:    Fase 2 (US-03)          → 24h
Semana 4:    Fase 3 (US-02 + US-04 + US-05) → 28h
Semana 5:    Fase 4 (US-06)          → 10h
```

**Total base:** 101h de tickets + 2h de buffer = **103h planificadas**.

**Total:** ~5 semanas a ritmo sostenido (26h/semana).

Si el ritmo es más relajado (15h/semana): ~8-9 semanas.
