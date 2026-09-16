# Plan de Implementación

Plan detallado para la implementación del proyecto Lit Microfrontends, basado en la documentación 01-10.

## Resumen ejecutivo

| Fase | Horas | Semana | Objetivo |
|------|-------|--------|----------|
| Fase 1: Core | 41h | 1-2 | Shell funcional con carga de MFEs y buffer |
| Fase 2: Data | 24h | 3 | MFEs que consumen APIs reales |
| Fase 3: Integración | 28h | 4 | Routing, comunicación y theming entre MFEs |
| Fase 4: Hardening | 10h | 5 | Seguridad y CSP |
| **Total planificado** | **103h** | **5** | |

> El total base de tickets es 101h. Las 103h del plan incluyen 2h de buffer de imprevistos en la Fase 1.

---

## Fase 1: Core (41h)

### Week 1: Fundamentos (20h)

| Ticket | Tarea | Horas | Dependencias |
|--------|-------|-------|--------------|
| T-01 | Configurar monorepo pnpm workspaces | 3h | — |
| T-02 | Crear paquete `shared` con tipos base | 4h | T-01 |
| T-03 | Configurar Vite en library mode para MFE | 4h | T-01 |
| T-04 | Implementar MFE dashboard (componente mínimo) | 6h | T-02, T-03 |
| T-05 | Implementar entry point con mount/unmount | 3h | T-04 |

**Entregable:** MFE dashboard compilable como ESM bundle con mount/unmount funcional.

### Week 2: Integración shell-MFE (21h)

| Ticket | Tarea | Horas | Dependencias |
|--------|-------|-------|--------------|
| T-06 | Crear shell con import map inline | 5h | T-01 |
| T-07 | Implementar mfe-loader con dynamic import | 5h | T-02, T-06 |
| T-08 | Integrar shell + MFE en desarrollo local | 4h | T-05, T-06, T-07 |
| T-09 | Configurar dev servers paralelos | 2h | T-08 |
| T-10 | Test end-to-end de carga en runtime | 3h | T-09 |
| — | Buffer de imprevistos | 2h | — |

**Estado:** Completada. El routing definido en T-23 queda fuera de esta fase y continúa en la Fase 3.

**Entregable:** Shell que carga MFE dashboard via import map en runtime.

---

## Fase 2: Data (24h) — Semana 3

| Ticket | Tarea | Horas | Dependencias |
|--------|-------|-------|--------------|
| T-11 | Crear config-map.json con endpoints DummyJSON | 3h | — |
| T-12 | Integrar config-map en shell y context | 3h | T-11 |
| T-13 | Implementar `@lit/task` en MFE dashboard | 6h | T-05 |
| T-14 | Crear componente orders-skeleton | 3h | — |
| T-15 | Crear componente error-message con retry | 3h | — |
| T-16 | Integrar fetch + skeleton + error en dashboard | 4h | T-13, T-14, T-15 |
| T-17 | Test con API externa (DummyJSON) | 2h | T-16 |

**Entregable:** Dashboard que carga órdenes desde una API con skeleton loading y error handling.

---

## Fase 3: Integración (28h) — Semana 4

**Estado actual:** Completada. T-18 a T-24 están implementados y la integración ha sido validada manualmente.

| Ticket | Tarea | Horas | Dependencias |
|--------|-------|-------|--------------|
| T-18 | Implementar event bus en shell | 4h | T-02 |
| T-19 | MFE settings con cambio de tema | 5h | T-05 |
| T-20 | Propagar tema a MFE dashboard via eventos | 4h | T-18, T-19 |
| T-21 | Definir design tokens CSS en shell | 3h | — |
| T-22 | Integrar tokens en ambos MFEs | 4h | T-21 |
| T-23 | Implementar routing con URLPattern | 5h | T-08 |
| T-24 | Test de navegación + theming + eventos | 3h | T-20, T-23 |

**Entregable:** Shell con routing funcional, cambio de tema global, MFEs comunicándose via eventos.

---

## Fase 4: Hardening (10h) — Semana 5

| Ticket | Tarea | Horas | Dependencias |
|--------|-------|-------|--------------|
| T-25 | Definir CSP estricta en shell | 3h | — |
| T-26 | Namespace en localStorage para MFEs | 2h | — |
| T-27 | Validación de eventos en shell | 3h | T-18 |
| T-28 | Test de seguridad y documentación final | 2h | T-25, T-26, T-27 |

**Estado actual:** En progreso. T-25 está completado y validado en navegador; T-26 a T-28 siguen pendientes.

**Entregable:** CSP funcionando, validación de eventos, storage namespaced.

---

## Camino crítico

```
T-01 → T-02 → T-04 → T-05 → T-08 → T-09 → T-10
T-01 → T-06 → T-07 ↗
```

---

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Import map conflicts en desarrollo | Media | Bajo | Usar `es-module-shims` como polyfill |
| Lit 3 sub-path imports no resuelven | Baja | Alto | Verificar URLs en import map antes de empezar |
| Shadow DOM CSS isolation incompleta | Baja | Medio | Revisar `::part()` y `::slotted()` |
| `@lit/task` no cancela fetch correctamente | Baja | Medio | Test de race conditions explícito |

---

## Punto de decisión

Después de la **Fase 1 (T-10)** tendrás un POC funcional: shell que carga un MFE via import map en runtime. Si quieres iterar rápido, puedes parar aquí y añadir las fases 2-4 después.

---

## Documentos relacionados

| Documento | Relación |
|-----------|----------|
| [08-user-stories.md](./08-user-stories.md) | User stories que originan los tickets |
| [09-backlog.md](./09-backlog.md) | Priorización MoSCoW y fases |
| [10-tickets.md](./10-tickets.md) | Detalle de tickets T-01 a T-28 y estado de ejecución |
