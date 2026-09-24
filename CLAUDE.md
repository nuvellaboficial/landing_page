# NuvelLab Landing Page

Sitio de marketing de NuvelLab, publicado en **`www.nuvellab.cloud`**. Su trabajo es convertir: que el dueño de un spa, barbería, peluquería canina o clínica en Colombia entienda en segundos qué hace NuvelLab y pida una demo o se registre. No es el producto: el producto es el dashboard (`app.nuvellab.cloud`, repo `nuvellab_frontend`) y el backend (`api.nuvellab.cloud`, repo `nuvellab_backend`).

Repo propio: `git@github.com:nuvellaboficial/landing_page.git` (rama `main`). Es independiente del dashboard y del backend, igual que ellos entre sí.

## Estado actual

La landing está implementada en Astro a partir del diseño de Claude Design (2026-09-24):

- El brief que se le pasó a Claude Design está en [`docs/prompt-claude-design.md`](./docs/prompt-claude-design.md).
- El diseño exportado (`.dc.html` + `support.js` + las capturas del dashboard que se usaron) está en [`docs/design/`](./docs/design/). Es la referencia visual y **no se despliega ni se importa**.
- El usuario quiere revisar el sitio montado y después pasar las correcciones.

Comandos: `npm run dev` (puerto 4321), `npm run build`, `npm run check` (tipos).

## Stack y despliegue

- **Astro** + **Tailwind CSS v4** + TypeScript strict. Sitio estático: cero JS por defecto; solo lo interactivo se hidrata como isla (React si hace falta).
- **Vercel**, conectado a este repo: un push a `main` despliega solo (igual que el dashboard).
- **Dominio:** `www.nuvellab.cloud` como dominio principal. El DNS de `nuvellab.cloud` está en Hostinger. Hoy `www` es un CNAME al dominio raíz, que apunta a una IP de parking de Hostinger y no sirve nada. Al conectar el dominio, ese CNAME se reemplaza por el valor que indique Vercel. Lo recomendable es que el dominio raíz también apunte a Vercel y redirija a `www`. No tocar los registros de `app.` (Vercel, dashboard), `api.` ni `panel.` (VPS con Coolify).

## Producto: qué se puede prometer

Fuente de verdad: [`../REQUIREMENTS-MVP.md`](../REQUIREMENTS-MVP.md) (secciones 1–3). Todo el copy sale de ahí y de lo que ya existe en el dashboard. **Nunca prometer funciones que no existen.** El modo Leads/CRM (inmobiliarias, concesionarios) es V2 y no va en la landing.

- **Bot de WhatsApp con IA:** agenda, cancela y reagenda citas; responde precios y duración de los servicios; escala a un humano lo que no sabe resolver.
- **Dashboard del dueño:** inicio del día, citas (lista y agenda por trabajador), clientes, equipo, servicios, caja diaria (ingresos/egresos) y anticipos por WhatsApp con verificación del comprobante.
- **Nichos del MVP:** spas, barberías, peluquerías caninas, clínicas (negocios con citas).
- **Precios: nunca van en la landing.** El usuario los negocia con cada cliente en una sesión privada. No hay sección de precios ni cifras de planes en ninguna parte del sitio.

## Decisiones de la landing (2026-09-24)

- **Solo modo oscuro.** No hay tema claro ni toggle. La paleta es la del tema dark del dashboard (ver Marca).
- **CTA principal: "Agenda una demo" con un asesor, por WhatsApp al +57 317 860 5783.** Enlace: `https://wa.me/573178605783?text=` con un mensaje precargado (p. ej. "Hola, quiero agendar una demo de NuvelLab"). Todos los CTAs de demo del sitio llevan ahí. No hay registro autónomo ni demo con el bot desde la landing.
- **Hero: partículas + dispositivos conectados.** Una nube de partículas (WebGL) se condensa y arma la laptop y el celular; en el celular el bot agenda una cita y un chorro de partículas viaja hasta la agenda de la laptop, donde la cita se materializa. Los dispositivos se inclinan en 3D con el cursor. La UI de los dispositivos es HTML/CSS encima del canvas, no dibujada en WebGL.
- **Prueba social con analíticas reales anonimizadas, cuando existan.** Al 2026-09-24 no hay datos reales del bot: el cliente real (un spa) usa el panel, pero su WhatsApp aún no pasa por NuvelLab, y la telemetría del bot solo tiene turnos de prueba. Mientras tanto, la sección de resultados muestra tres hechos verificables del producto: "24/7", "2 a 3 días" (de la demo al bot en vivo) y "Tu mismo número". Cuando haya al menos un mes de uso real del bot, se reemplazan por métricas reales anonimizadas (citas agendadas por el bot, % de mensajes fuera de horario, tiempo de respuesta), sin nombrar al negocio. Nunca inventar números.
- **Datos del onboarding:** el cliente no cambia de número de WhatsApp, y la puesta en marcha tarda de 2 a 3 días mientras su número se agrega a la WABA de NuvelLab.
- **Referencia visual: spur.us.** De ahí se toman el titular gigante partido en el grid y los CTAs en monoespaciada entre corchetes (solo en CTAs y navegación). Su verde lima se cambia por el naranja de NuvelLab. La cuadrícula de fondo con cruces se probó y **se quitó** a pedido del usuario.
- **Las partículas guían la atención (2026-09-24).** Un único campo de partículas (`src/scripts/particles/field.ts`) vive detrás de todo el contenido; nunca se dibuja por delante de dispositivos ni texto. En cada sección rodean lo que hay que mirar (elementos con `data-focus="<grupo>"`), se dispersan entre secciones y se reagrupan en la siguiente. Para que una sección nueva participe, basta marcar su elemento protagonista con `data-focus`. Las preguntas frecuentes no tienen foco: ahí las partículas solo flotan.
- **Toda la página es interactiva con el scroll:** cada sección tiene su propio momento de entrada y salida, pensado para su contenido; nunca el mismo fade-up repetido. GSAP + ScrollTrigger + Lenis. En móvil se simplifica y se respeta `prefers-reduced-motion`.
- **Mockups simulados del producto:** marcos de laptop y celular con la UI del dashboard y del chat de WhatsApp recreada en HTML/CSS y animada (cursor, citas que aparecen, cifras que suben). No son videos ni capturas estáticas; así se ven nítidos en cualquier pantalla y pesan poco.
- **Responsive de verdad:** cada sección se diseña para desktop y para móvil, no se encoge. En móvil los mockups se reducen al celular cuando la laptop no cabe.

## Marca

La landing usa la marca del **tema dark** del dashboard, para que el salto de la landing a la app no se sienta como otro producto. Los tokens reales están en el bloque `.dark` de [`../nuvellab_frontend/src/app/globals.css`](../nuvellab_frontend/src/app/globals.css):

- Fondo negro neutro (`--background` oklch 0.1448) y texto casi blanco. Acento naranja `--primary` `≈#ff9933`, con tinta blanca encima. Si hace falta más contraste en un relleno de marca, se oscurece el relleno, nunca se aclara la tinta.
- Tipografía: Inter (texto) + Geist (títulos y cifras).
- Logos: `../nuvellab_frontend/public/logo-light.png` y `logo-dark.png`.

Las referencias visuales pueden mover esto (por ejemplo, más expresivo en la landing que en el dashboard). Cualquier cambio de marca se decide explícitamente con el usuario, no se inventa.

## Copy y tono

- Todo el texto visible va en **español de Colombia**. Nombres de código, commits y comentarios técnicos, en inglés.
- Al dueño del negocio se le dice **"el dueño"** (genérico), nunca "la dueña".
- Dinero en formato colombiano: `$249.000 COP` (punto de miles, sin decimales).
- Se le habla a un dueño de negocio, no a un técnico: "tus clientes agendan solos por WhatsApp", no "agente LLM con tool calling".
- Mobile-first: la mayoría de visitantes llegan desde el celular, muchas veces con datos móviles. El peso de la página y el LCP importan más que cualquier efecto.

## Skills de diseño

Instaladas en [`.claude/skills/`](./.claude/skills/) con `npx skills` (ver `skills-lock.json`). Cada una tiene un rol distinto:

| Skill | Para qué se usa aquí |
|---|---|
| `frontend-design` (Anthropic) | Dirección visual: fundamentar el diseño en el oficio real del cliente, el plan de tokens (4–6 colores, tipografía, layout) y evitar los looks típicos de la IA. Base del prompt para Claude Design. |
| `design-taste-frontend` (taste-skill) | Específica para landing pages: el "Design Read", los diales de variación/movimiento/densidad y la disciplina anti-plantilla. Aporta el vocabulario y las restricciones del prompt. |
| `ui-ux-pro-max` | Base de datos consultable (estilos, paletas, pares tipográficos, patrones de landing, reglas de UX) vía `python3 .claude/skills/ui-ux-pro-max/scripts/search.py`. Sirve para validar decisiones con datos, no para escoger la identidad a ciegas. |
| `awesome-design` | Colección de DESIGN.md de sitios reales (Stripe, Linear, Cal.com, Wise, Intercom…). Sirve para traducir una referencia visual a tokens concretos. |
| `web-design-guidelines` (Vercel) | Auditoría del código ya implementado (accesibilidad, foco, touch, performance). Se usa después de construir, no para el prompt. |

Cuando dos skills se contradigan, ganan las decisiones explícitas del usuario y lo que diga este archivo.

## Política de tratamiento de datos

Vive en `/politica-de-tratamiento-de-datos` (`src/pages/politica-de-tratamiento-de-datos.astro`) y **esta es la única versión vigente**. El texto está en `src/components/legal/PrivacyPolicy.astro`, portado literal de la v1.0 que se publicaba en GitHub Pages (repo `politicas-nuvel_lab`). Desde el 2026-09-24 ese repo solo redirige la URL antigua (`nuvellaboficial.github.io/politicas-nuvel_lab/`) a la nueva; el original queda en su historial de git. Es texto legal: no se edita sin revisión del usuario.

## Código

- **Clean code y patrones cuando aporten claridad.** El diseño de Claude Design (`docs/design/`) es la referencia visual, no código para copiar: se reestructura en componentes pequeños de una sola responsabilidad.
- **Estructura:** `src/lib/` tiene los datos (`data.ts`), las utilidades puras (`util.ts`) y las plantillas HTML compartidas entre el build y el navegador (`templates.ts`). `src/components/` tiene un componente Astro por sección más los marcos reutilizables (celular, laptop, panel). `src/scripts/` tiene un controlador por sección que implementa la interfaz `Section` y un coordinador único (`main.ts`) que reparte scroll y resize.
- **Rendimiento:** un solo bucle de `requestAnimationFrame`, listeners pasivos, `IntersectionObserver` para lo que entra en pantalla, animar solo `transform` y `opacity`, pausar el canvas cuando no se ve y límite de DPR 2.
- **`prefers-reduced-motion`:** la página pasa a "modo quieto" (clase `still` en `<html>`): nada fijado, todo en su estado final.
- Todo el texto va en el HTML generado en el build (SEO y visitantes sin JS).

## Reglas heredadas del monorepo

- Nunca correr pruebas automatizadas contra `app.nuvellab.cloud` ni `api.nuvellab.cloud`. La landing solo enlaza al dashboard; las pruebas se hacen en local.
- Confirmar cada commit con el usuario antes de hacerlo.
