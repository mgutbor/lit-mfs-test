# User Stories

User stories del proyecto Lit Microfrontends, generadas a partir de la documentación técnica (01-07).

---

## Template

```markdown
## US-{编号}: {título}

**Como** {rol}
**Quiero** {funcionalidad}
**Para** {valor/objetivo}

**Criterios de aceptación:**
- [ ] CA-1: ...
- [ ] CA-2: ...

**Dependencias:** US-xx, US-yy
**Prioridad:** Must / Should / Could / Won't
**Estimación estimada:** X horas
```

---

## US-01: Cargar un MFE en runtime via import map

**Como** desarrollador de frontend
**Quiero** que el shell cargue un MFE dinámicamente en runtime via import map nativo del navegador
**Para** que los MFEs se desplieguen de forma independiente sin necesidad de rebuild del shell

**Criterios de aceptación:**
- [ ] CA-1: El shell resuelve el MFE desde el import map usando `import()` dinámico
- [ ] CA-2: El MFE se monta en un contenedor DOM proporcionado por el shell
- [ ] CA-3: El MFE exporta una función `mount(container, context)` que retorna una función de cleanup
- [ ] CA-4: El shell puede desmontar el MFE llamando a la función de cleanup
- [ ] CA-5: El import map resuelve correctamente las dependencias compartidas (lit, lit-context)
- [ ] CA-6: En desarrollo, cada MFE corre en su propio servidor Vite

**Dependencias:** Ninguna (es la base del sistema)
**Prioridad:** Must
**Estimación estimada:** 39 horas

---

## US-02: Navegar entre MFEs sin recarga de página

**Como** usuario de la aplicación
**Quiero** navegar entre las diferentes secciones (MFEs) usando el menú de navegación
**Para** tener una experiencia SPA fluida sin recargas completas de página

**Criterios de aceptación:**
- [ ] CA-1: El shell usa `URLPattern` para resolver qué MFE cargar según la URL
- [ ] CA-2: Al hacer click en un link del menú, el shell actualiza la URL via `history.pushState`
- [ ] CA-3: El shell desmonta el MFE anterior y monta el nuevo sin recarga
- [ ] CA-4: El botón "Atrás" del navegador funciona correctamente
- [ ] CA-5: Los MFEs con sub-rutas reciben la sub-ruta como atributo `route`
- [ ] CA-6: El routing interno del MFE se gestiona con LitroRouter o URLPattern propio

**Dependencias:** US-01
**Prioridad:** Must
**Estimación estimada:** 28 horas

---

## US-03: Consumir datos de una API REST en un MFE

**Como** usuario de la aplicación
**Quiero** ver datos reales (órdenes, analytics, configuración) en los MFEs
**Para** que la aplicación muestre información actualizada del backend

**Criterios de aceptación:**
- [ ] CA-1: El config-map.json centraliza las URLs de los endpoints
- [ ] CA-2: El shell carga el config-map y pasa la sección relevante a cada MFE via `mount(context)`
- [ ] CA-3: Cada MFE usa `@lit/task` para hacer fetch de datos con estados loading/complete/error
- [ ] CA-4: El fetch incluye `AbortSignal` para cancelar requests obsoletos
- [ ] CA-5: Se muestra un skeleton loading mientras se cargan los datos
- [ ] CA-6: Se muestra un mensaje de error con botón de retry si el fetch falla
- [ ] CA-7: Las URLs del config-map se pueden actualizar sin rebuild del shell

**Dependencias:** US-01
**Prioridad:** Must
**Estimación estimada:** 24 horas

---

## US-04: Comunicar MFEs entre sí via eventos

**Como** desarrollador de frontend
**Quiero** que los MFEs puedan enviarse eventos entre sí usando un event bus compartido
**Para** que un cambio en un MFE (ej: cambio de tema) se propague a los demás MFEs

**Criterios de aceptación:**
- [ ] CA-1: El shell inyecta un event bus en `mount(context)`
- [ ] CA-2: Los MFEs emiten eventos usando `CustomEvent` en el propio elemento
- [ ] CA-3: Los eventos usan la naming convention `{mfe-name}:{action}`
- [ ] CA-4: El shell escucha eventos de los MFEs y puede reaccionar (navegar, propagar)
- [ ] CA-5: Los MFEs pueden escuchar eventos del shell (theme-changed, locale-changed)
- [ ] CA-6: Los listeners se limpian correctamente en `disconnectedCallback`

**Dependencias:** US-01
**Prioridad:** Should
**Estimación estimada:** 16 horas

---

## US-05: Aplicar theming consistente entre MFEs

**Como** usuario de la aplicación
**Quiero** que todos los MFEs tengan el mismo aspecto visual (colores, tipografía, espaciado)
**Para** que la aplicación tenga una experiencia visual coherente

**Criterios de aceptación:**
- [ ] CA-1: Los design tokens se definen como CSS Custom Properties en el shell
- [ ] CA-2: Los MFEs usan los tokens via `var(--token-name)` con fallback al design system
- [ ] CA-3: El shell puede cambiar el tema (light/dark) actualizando las CSS Custom Properties
- [ ] CA-4: Los MFEs reaccionan al cambio de tema via eventos o atributos
- [ ] CA-5: Los estilos de cada MFE están encapsulados en Shadow DOM
- [ ] CA-6: Los MFEs siguen el patrón de CSS Theme definido en 07-component-guidelines.md

**Dependencias:** US-04
**Prioridad:** Should
**Estimación estimada:** 12 horas

---

## US-06: Aislar MFEs con Content Security Policy

**Como** administrador de la aplicación
**Quiero** que cada MFE esté aislado mediante CSP para prevenir ataques XSS
**Para** que un MFE comprometido no pueda afectar a otros MFEs ni al shell

**Criterios de aceptación:**
- [x] CA-1: El shell define una CSP estricta en el HTML (sin `unsafe-eval`, sin `unsafe-inline`)
- [x] CA-2: Los MFEs no pueden acceder al `localStorage` de otros MFEs (namespace obligatorio)
- [x] CA-3: Los eventos se validan en el shell (shape del `detail`)
- [x] CA-4: Las URLs del import map usan versiones pinneadas (nunca `@latest`)
- [ ] CA-5: Los MFEs de terceros se aíslan en iframe con sandbox
- [ ] CA-6: Se documentan los headers de seguridad (X-Content-Type-Options, X-Frame-Options)

**Dependencias:** US-01
**Prioridad:** Could
**Estimación estimada:** 10 horas

---

## Resumen

| ID | Título | Prioridad | Horas |
|----|--------|-----------|-------|
| US-01 | Cargar MFE en runtime via import map | Must | 39h |
| US-02 | Navegar entre MFEs sin recarga | Must | 28h |
| US-03 | Consumir datos de API REST | Must | 24h |
| US-04 | Comunicar MFEs via eventos | Should | 16h |
| US-05 | Aplicar theming consistente | Should | 12h |
| US-06 | Aislar MFEs con CSP | Could | 10h |
| **Total** | | | **129h** |
