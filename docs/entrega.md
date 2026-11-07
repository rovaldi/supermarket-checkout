# Documentación de la entrega

**Proyecto:** Supermarket Checkout  
**Prueba técnica:** Classora Technologies  
**Diseño:** [Supermarket Checkout – Figma](https://www.figma.com/design/Sd9ppmpNXQLRxCiEqY3WAE/supermarket-checkout)  
**Aplicación:** [Ver demo publicada](https://supermarket-checkout-rob.vercel.app/)  
**Repositorio:** [GitHub – supermarket-checkout](https://github.com/rovaldi/supermarket-checkout)

---

## 1. Descripción del proyecto

La aplicación reproduce el flujo principal de una caja de supermercado en una única pantalla.

El objetivo es que el cajero pueda introducir productos, consultar y modificar las líneas de la venta, revisar el importe total y completar el proceso de cobro sin cambiar de vista.

La interfaz prioriza la lectura rápida, la identificación de los productos y el acceso a las acciones principales, teniendo en cuenta su utilización en un entorno de caja y mediante pantallas táctiles.

La aplicación está desarrollada con React y TypeScript, y cuenta con una API propia para gestionar las consultas al catálogo y el registro de las ventas.

## 2. Arquitectura

El proyecto está organizado en cuatro áreas principales, con responsabilidades diferenciadas:

### `lib/` – Dominio y reglas de negocio

Contiene la lógica que no depende de React ni de la interfaz:

- Validación de códigos EAN-13, incluido el cálculo del dígito de control.
- Operaciones monetarias mediante céntimos enteros.
- Tipos compartidos entre cliente y servidor.
- Catálogo de 20 productos de demostración.
- Búsqueda de productos y reglas para crear una venta.

Dentro de `lib/server/` se encuentran las operaciones que trabajan con el catálogo y gestionan las ventas.

### `api/` – Capa HTTP

Contiene los endpoints que exponen las operaciones del servidor:

- `GET /api/products`: consulta de productos por código o prefijo.
- `POST /api/sales`: validación y registro de una venta.

Esta capa se mantiene deliberadamente fina: interpreta la petición HTTP, delega el trabajo en la lógica de `lib/` y devuelve la respuesta correspondiente.

### `src/` – Aplicación y presentación

Contiene la interfaz desarrollada con React 19.

La aplicación tiene una única pantalla (`Checkout`), sin router ni navegación entre páginas.

Sus principales responsabilidades están separadas:

- `pages/Checkout/`: composición de la pantalla y coordinación del flujo de caja.
- `hooks/useSale.ts`: estado y operaciones de la venta en el cliente.
- `api/client.ts`: comunicación HTTP y validación de las respuestas JSON.
- `components/`: componentes reutilizables de interfaz.
- `styles/`: estilos globales y reset.
- `types/`: tipos específicos de la interfaz.
- `utils/`: utilidades para la gestión de fechas y horas.

El componente `App` se limita a renderizar la pantalla `Checkout`, evitando introducir lógica de negocio en la entrada de la aplicación.

### Vite y ejecución local

Durante el desarrollo, Vite utiliza un plugin definido en `vite.config.ts` para atender las rutas `/api/`.

Este plugin llama a las mismas funciones HTTP que se utilizan en el despliegue de Vercel. Así se evita mantener dos implementaciones diferentes de la API.

En producción, Vercel expone directamente los archivos de `api/` como funciones serverless.

Los imports de los módulos del servidor utilizan la extensión `.js` para que Node pueda resolver correctamente los módulos ESM una vez compilados y ejecutados en el entorno de Vercel.

### Flujo de comunicación

```text
Checkout
   │
   ├── useSale
   │     └── Estado y operaciones de la venta
   │
   └── api/client.ts
          │
          ├── GET /api/products
          └── POST /api/sales
                  │
                  ├── Vercel: funciones de api/
                  │
                  └── Local: plugin de Vite
                           │
                           ▼
                      lib/server/
                           │
                           ▼
                       Catálogo
                       EAN-13
                       Dinero
```

El navegador no importa el catálogo ni consulta directamente las funciones del servidor. Toda la comunicación se realiza mediante HTTP.

## 3. Gestión de productos y ventas

### Introducción y validación de códigos

Los productos se localizan introduciendo manualmente un código EAN-13.

El botón «Añadir» se habilita al completar los 13 dígitos. La validación del dígito de control se realiza al intentar añadir el producto, de modo que un código de longitud correcta pero con un dígito incorrecto pueda mostrar un mensaje de validación específico.

Se distinguen dos situaciones:

- Código con formato o dígito de control incorrecto: se muestra un mensaje indicando que el código no es válido y no se realiza la consulta.
- Código EAN-13 válido que no existe en el catálogo: se informa de que no se ha encontrado ningún producto.

### Autocompletado

A partir de tres dígitos se consultan coincidencias en el catálogo mediante búsqueda por prefijo.

La primera sugerencia no queda seleccionada automáticamente. Esto permite que la tecla Enter no añada accidentalmente un producto solo por aparecer como primera coincidencia.

El comportamiento contempla:

- Flechas arriba y abajo para desplazarse por las sugerencias.
- Enter para confirmar una sugerencia activa.
- Escape para cerrar la lista.
- Seleccionar una sugerencia para rellenar el campo sin añadir directamente el producto.

### Gestión de líneas

Cada producto añadido se incorpora a la venta.

Si se introduce un código que ya está presente, se incrementa su cantidad en la línea existente en lugar de generar una nueva.

También se contemplan estos comportamientos:

- Una línea nueva recibe una animación visual breve.
- Una línea repetida queda seleccionada para facilitar su identificación.
- Las cantidades no pueden ser inferiores a uno.
- Los valores vacíos, cero, negativos o decimales se rechazan y se restaura la cantidad anterior.
- La eliminación de una línea es inmediata y permite deshacer la operación durante unos segundos.
- Vaciar la venta requiere una confirmación previa.

### Proceso de cobro

Para finalizar la venta es necesario seleccionar uno de los tres métodos disponibles:

- Efectivo.
- Tarjeta.
- Ticket restaurante.

El botón de cobro permanece desactivado hasta seleccionar un método de pago.

Al iniciar el proceso:

1. Se envían las líneas y el método de pago a `POST /api/sales`.
2. Se muestra el estado «Cobrando…» durante un mínimo de 180 ms.
3. Se evita iniciar otra operación mientras el cobro está en curso.
4. Si la operación termina correctamente, se muestra el resumen de venta completada y la opción de iniciar una nueva venta.
5. Si la API devuelve un error, se conserva el contenido del carrito y se muestra el mensaje correspondiente.

## 4. API y tratamiento de datos

La API centraliza las operaciones que necesitan consultar el catálogo o registrar una venta.

### Consulta de productos

`GET /api/products`

Permite dos modalidades de consulta.

**Búsqueda por código:**

```http
GET /api/products?code=2000000750019
```

Comprueba el formato del código, su dígito de control y su existencia en el catálogo.

Las respuestas contemplan:

| Situación | Código HTTP | Error |
|---|---:|---|
| Código válido y encontrado | 200 | — |
| Formato incorrecto | 400 | `invalid_code` |
| Dígito de control incorrecto | 400 | `invalid_check` |
| Producto inexistente | 404 | `not_found` |

**Búsqueda por prefijo:**

```http
GET /api/products?q=200
```

Admite prefijos de entre 3 y 13 dígitos y devuelve las coincidencias encontradas.

Si el prefijo no cumple las condiciones, se devuelve una lista vacía.

### Registro de ventas

`POST /api/sales`

Recibe el método de pago y las líneas de la venta.

Ejemplo de petición:

```json
{
  "paymentMethod": "efectivo",
  "lines": [
    {
      "code": "2000000750019",
      "quantity": 2
    }
  ]
}
```

El servidor valida el contenido recibido:

- El cuerpo debe tener la estructura esperada.
- Debe existir al menos una línea.
- El método de pago debe pertenecer a los valores permitidos.
- Cada línea debe contener un código y una cantidad entera mayor o igual que uno.
- Los códigos se vuelven a validar.
- Los productos deben existir en el catálogo.

Las líneas con el mismo código se agrupan y sus cantidades se suman.

El precio se obtiene siempre del catálogo del servidor. El cliente no envía importes ni puede establecer el precio de los productos.

### Validación de respuestas en el cliente

`src/api/client.ts` centraliza las llamadas HTTP y comprueba que el JSON recibido tenga la estructura esperada antes de utilizarlo.

Si una respuesta no cumple el contrato previsto, se genera un `ApiRequestError` con el tipo de error de red correspondiente.

De esta forma, la interfaz no utiliza respuestas incompletas o con una estructura inesperada.

## 5. Gestión monetaria

Todos los importes se almacenan y calculan en céntimos enteros.

Por ejemplo:

| Importe | Valor interno |
|---|---:|
| 0,60 € | 60 |
| 0,95 € | 95 |
| 8,90 € | 890 |

El importe de cada línea se calcula multiplicando el precio unitario por la cantidad.

El total de la venta se obtiene sumando los importes de todas las líneas.

La conversión a euros se realiza únicamente al presentar los importes en pantalla.

Esta decisión evita los problemas de precisión que pueden aparecer al realizar operaciones monetarias con números decimales.

Además, el servidor vuelve a obtener los precios del catálogo y calcula nuevamente los importes antes de devolver el resultado de la venta.

## 6. Diseño y sistema visual

La interfaz utiliza un tema claro, con una estética funcional y una jerarquía visual pensada para un entorno de caja.

El diseño prioriza:

- Identificación rápida de los productos.
- Lectura destacada del importe total.
- Acceso directo a las acciones principales.
- Diferenciación visual entre estados normales, seleccionados, errores y confirmaciones.
- Controles suficientemente grandes para su utilización táctil.

### Design tokens

Los valores visuales se centralizan en `public/design-tokens.css`.

Los tokens incluyen colores, tipografía, espaciados, radios y dimensiones de interacción.

Se utiliza una nomenclatura basada en BEM, siguiendo una estructura consistente con la utilizada en las clases de los componentes.

Por ejemplo:

```css
--color__text--primary
--color__action--primary
--spacing--touch
```

El objetivo es evitar valores visuales definidos directamente en cada componente y mantener un sistema coherente y fácil de ajustar.

## 7. Responsive y resoluciones

La distribución de la interfaz cambia según el espacio disponible.

A partir de 1024 px, la lista de productos y el panel de cobro se muestran en columnas. El panel de pago mantiene un ancho de 420 px.

Por debajo de ese breakpoint, los bloques se apilan para conservar el espacio necesario para los controles y la información.

Se han tomado como referencia las siguientes resoluciones:

| Resolución | Objetivo |
|---|---|
| 1024 × 768 | Ancho mínimo de referencia para mantener visibles las acciones principales. |
| 1280 × 800 | Comprobar la distribución en un espacio horizontal más ajustado. |
| 1366 × 768 | Revisar la composición en una pantalla panorámica habitual. |
| 1920 × 1080 | Aprovechar el espacio adicional manteniendo la jerarquía y las proporciones. |

También se ha revisado la disposición en orientación vertical.

Los botones y controles principales tienen una altura mínima de 48 px, siguiendo el objetivo de interacción táctil establecido para la interfaz.

## 8. Accesibilidad

La accesibilidad se ha tenido en cuenta durante la implementación de los componentes y sus estados, sin tratarla como un añadido posterior.

Entre las decisiones adoptadas:

- Estructura semántica con encabezados para las secciones principales.
- Campo de código implementado como combobox, con gestión de opciones y estados accesibles.
- Uso de `aria-invalid` para indicar entradas incorrectas.
- Mensajes de error anunciados mediante `role="alert"`.
- Asociación de las instrucciones del campo mediante `aria-describedby`, evitando anunciar el mismo error dos veces.
- Control de cantidades con semántica de `spinbutton`, valor y mínimo.
- Métodos de pago agrupados mediante un radiogrupo.
- Nombres accesibles para acciones como eliminar productos o modificar cantidades.
- Ventanas modales implementadas como diálogos con título.
- Indicadores de foco visibles.
- Iconos decorativos ocultos a tecnologías de asistencia.
- Respeto por la preferencia `prefers-reduced-motion`.

Durante el proceso de cobro se utiliza `aria-busy` para comunicar el estado de procesamiento sin desactivar el botón primario mediante el atributo `disabled` y alterar su apariencia.

### Contraste

Se han revisado las principales combinaciones de texto y fondo tomando como referencia WCAG 2.1 AA.

Las relaciones de contraste de las parejas principales son:

| Texto | Fondo | Contraste |
|---|---|---:|
| Negro `#1A1D21` | Blanco | 16,9:1 |
| Negro `#1A1D21` | Gris `#F7F8FA` | 15,9:1 |
| Gris `#5C6570` | Blanco | 5,9:1 |
| Azul `#1E4ED8` | Blanco | 6,7:1 |
| Blanco | Azul `#1E4ED8` | 6,7:1 |
| Rojo `#B42318` | Blanco | 6,6:1 |
| Verde `#0F6B4C` | Blanco | 6,5:1 |

WCAG AA establece una relación mínima de 4,5:1 para texto normal.

Las combinaciones principales superan ese umbral. Los estados desactivados tienen una opacidad reducida deliberadamente y no se consideran combinaciones de texto principal.

**Nota:** estas comprobaciones corresponden a las combinaciones indicadas; no constituyen una auditoría completa de accesibilidad de toda la aplicación.

## 9. Pruebas y calidad de código

El proyecto cuenta con 41 pruebas automatizadas ejecutadas mediante Vitest.

Se utilizan Testing Library y jsdom para las pruebas de componentes e interacción.

Los tests de dominio no necesitan renderizar la interfaz. Los tests de componentes utilizan consultas por rol, nombre accesible o texto visible, evitando depender innecesariamente de la estructura interna del HTML.

La cobertura funcional contempla:

| Área | Casos comprobados |
|---|---|
| EAN-13 | Código válido, dígito incorrecto, letras y ceros iniciales. |
| Dinero | Total de línea, suma de importes y formato en euros. |
| Productos | Búsqueda por código, prefijo, producto inexistente y errores de validación. |
| Ventas | Venta válida, recálculo del precio, cantidades inválidas y líneas duplicadas. |
| Campo de código | Longitud, activación de Añadir, sugerencias y navegación por teclado. |
| Cantidades | Incremento, mínimo, valores inválidos y restauración. |
| Pantalla | Incorporación, repetición, eliminación, total, cobro, errores, doble envío y nueva venta. |

El entorno de pruebas también configura `matchMedia` y limpia el DOM entre casos.

### Herramientas de calidad

Se utilizan las siguientes herramientas:

- TypeScript en modo `strict`.
- ESLint para análisis estático de código.
- Prettier para mantener el formato.
- Stylelint para revisar los estilos.
- Vitest para pruebas automatizadas.
- GitHub Actions para integración continua.

El workflow ejecuta las comprobaciones de lint, ambos procesos de typecheck y los tests en cada push y pull request a `main`.

### Comandos

```bash
yarn lint
yarn typecheck
yarn typecheck:tests
yarn test
yarn build
```

La compilación ejecuta `tsc -b` y posteriormente `vite build`.

## 10. Funcionalidades simuladas y limitaciones

La aplicación reproduce el flujo de una venta, pero no está conectada a los dispositivos ni servicios reales de un supermercado.

### Catálogo

El catálogo contiene 20 productos de demostración.

Los códigos siguen el formato EAN-13 y utilizan el prefijo 200. Son identificadores de prueba y no referencias comerciales registradas.

La introducción se realiza manualmente. No se ha implementado integración con lectores físicos de códigos de barras ni lectura mediante cámara.

### Pagos

Se pueden seleccionar efectivo, tarjeta o ticket restaurante.

La selección se utiliza en el flujo de demostración y se envía a la API, pero no existe conexión con un datáfono, pasarela de pago ni cajón de efectivo.

No se realiza ningún cargo real.

### Ticket e impresión

El número de ticket es fijo (`1042`) y no existe una numeración correlativa.

El indicador de impresión muestra «Papel cero». No se genera un documento ni se envía ningún trabajo a una impresora física.

### Caja y cajero

Los valores «Caja 3» y «Cajero 12» son datos fijos.

No existe autenticación, identificación de empleados ni gestión de turnos.

### Persistencia

No se utiliza una base de datos ni almacenamiento persistente.

La venta se mantiene durante la sesión, pero se pierde al recargar la página.

La hora de la cabecera utiliza el reloj local del dispositivo. La fecha y hora del resumen de venta se establecen al completar el cobro y permanecen fijas en ese resumen.

## 11. Uso de inteligencia artificial

Durante el desarrollo he utilizado Cursor como herramienta de asistencia en el editor y ChatGPT como apoyo para contrastar decisiones técnicas y de UX/UI.

Figma se ha utilizado para definir el diseño y como referencia visual durante la implementación.

### Herramientas y ámbitos de uso

**Cursor**

Me ha ayudado en distintas fases del desarrollo:

- Preparación de parte de la estructura inicial del proyecto y configuración de herramientas.
- Implementación de componentes y funcionalidades en React.
- Desarrollo de la API de la prueba, incluyendo los endpoints de consulta de productos y registro de ventas.
- Apoyo en la implementación de pruebas automatizadas.
- Revisión de código, depuración y resolución de problemas durante el desarrollo.

**ChatGPT**

Lo he utilizado como apoyo para:

- Contrastar decisiones de UX/UI y comportamiento de los controles.
- Consultar buenas prácticas de React, TypeScript, CSS y accesibilidad.
- Revisar planteamientos de arquitectura y organización del código.
- Analizar errores y posibles mejoras.
- Preparar y revisar la documentación de la entrega.

### Decisiones y revisión de resultados

Los requisitos funcionales y los criterios de comportamiento los he definido y revisado durante el desarrollo. Las propuestas generadas con IA se han utilizado como punto de partida y se han ajustado cuando no respondían al comportamiento esperado.

Algunos ejemplos concretos:

- Separar la comprobación de la longitud del código de la validación del dígito de control EAN-13.
- Diferenciar los errores de código incorrecto y producto inexistente.
- Evitar que la primera sugerencia del autocompletado se seleccione automáticamente.
- Mantener las líneas de la venta cuando falla el cobro.
- Evitar operaciones de cobro duplicadas.
- Hacer que el servidor recalcule los precios a partir del catálogo.
- Centralizar los valores visuales mediante design tokens y mantener una nomenclatura coherente con BEM.
- Incorporar estados y atributos accesibles en los controles y mensajes de la interfaz.

En las pruebas, definí los escenarios funcionales que debía cubrir la aplicación y utilicé asistencia de IA para trasladar parte de esos casos a pruebas automatizadas. Revisé su comportamiento y los resultados de ejecución.

También se realizaron correcciones durante el despliegue. Entre ellas, el ajuste de las extensiones de los imports de servidor a `.js` para resolver correctamente los módulos en el entorno de ejecución de Vercel, solucionando un error 500 en la consulta de productos.

La IA ha sido una herramienta de apoyo durante el proceso, mientras que las decisiones funcionales, la revisión de los resultados y los ajustes finales se han realizado teniendo en cuenta los requisitos de la prueba.

---

## 12. Documentación relacionada

- [README](../README.md): instalación, ejecución y comandos del proyecto.
- [Guía de demostración](demo-guide.md): catálogo y escenarios para probar la aplicación.
- [Diseño en Figma](https://www.figma.com/design/Sd9ppmpNXQLRxCiEqY3WAE/supermarket-checkout).
- [Aplicación publicada](https://supermarket-checkout-rob.vercel.app/).
- [Repositorio GitHub](https://github.com/rovaldi/supermarket-checkout).