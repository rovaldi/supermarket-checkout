# Supermarket Checkout

Aplicación de caja para supermercado desarrollada como prueba técnica para Classora.

Permite gestionar una venta desde una única pantalla: introducir códigos de producto, consultar el catálogo, modificar cantidades, revisar el importe y completar el flujo de cobro.

La aplicación utiliza React y TypeScript en el cliente, con una API propia que centraliza las reglas de negocio y el cálculo de precios.

<text></text>

## 🚀 Demo

**[Ver aplicación publicada](https://supermarket-checkout-rob.vercel.app/)**

**[Ver diseño en Figma](https://www.figma.com/design/Sd9ppmpNXQLRxCiEqY3WAE/supermarket-checkout)**

## ✨ Funcionalidades

- Introducción manual de códigos EAN-13 y búsqueda de productos por prefijo.
- Autocompletado de productos a partir de tres dígitos.
- Validación del formato y del dígito de control EAN-13.
- Gestión de cantidades y productos repetidos.
- Eliminación de productos con posibilidad de deshacer.
- Confirmación antes de vaciar la venta.
- Selección entre efectivo, tarjeta y ticket restaurante.
- Cálculo de importes en céntimos enteros.
- Validación de datos tanto en cliente como en servidor.
- Estados de carga, confirmación y error durante las operaciones.
- Diseño responsive y controles preparados para interacción táctil.

## 🧱 Arquitectura

El proyecto separa las reglas de negocio, la comunicación HTTP y la interfaz en tres áreas principales:

| Directorio | Responsabilidad |
|---|---|
| `lib/` | Dominio, validación EAN-13, gestión monetaria, catálogo y reglas de venta. |
| `api/` | Endpoints HTTP para consultar productos y registrar ventas. |
| `src/` | Aplicación React, componentes, estado de la venta y cliente HTTP. |

La API utiliza las mismas funciones tanto en desarrollo local como en el despliegue de Vercel. El navegador no contiene el catálogo ni envía precios: el servidor obtiene los importes a partir de sus propios datos.

## 🛠️ Stack tecnológico

| Área | Tecnologías |
|---|---|
| Interfaz | React 19, TypeScript 5.8 |
| Estilos | Sass, CSS Modules, BEM |
| Diseño | Design tokens CSS |
| Herramientas de desarrollo | Vite 8 |
| Calidad de código | ESLint, Prettier, Stylelint |
| Testing | Vitest 5, Testing Library, jsdom |
| Automatización | GitHub Actions |
| Despliegue | Vercel |

El proyecto utiliza TypeScript en modo estricto y una configuración de herramientas para mantener la consistencia del código y los estilos.

## 📋 Requisitos

- Node.js 22.
- Corepack.
- Yarn 4.12 (declarado en `package.json` mediante `packageManager`).

## ⚙️ Instalación y ejecución

Clona el repositorio:

```bash
git clone https://github.com/rovaldi/supermarket-checkout.git
cd supermarket-checkout
```

Activa Corepack e instala las dependencias:

```bash
corepack enable
yarn install
```

Inicia el entorno de desarrollo:

```bash
yarn dev
```

Abre la dirección que muestra Vite en la terminal (por defecto, `http://localhost:5173`).

No es necesario configurar variables de entorno ni disponer de una base de datos.

## 🧪 Comprobaciones

El proyecto incluye pruebas unitarias y de componentes, además de comprobaciones estáticas.

```bash
yarn lint
yarn typecheck
yarn typecheck:tests
yarn test
yarn build
```

| Comando | Descripción |
|---|---|
| `yarn lint` | Ejecuta ESLint y Stylelint. |
| `yarn typecheck` | Comprueba los tipos de la aplicación. |
| `yarn typecheck:tests` | Comprueba los tipos de las pruebas. |
| `yarn test` | Ejecuta los tests con Vitest. |
| `yarn build` | Ejecuta la compilación de TypeScript y genera el build de Vite. |

También está disponible:

```bash
yarn preview
```

para servir localmente la compilación generada.

El repositorio incorpora un workflow de GitHub Actions que ejecuta las comprobaciones de calidad y los tests en cada push y pull request a `main`, utilizando Node.js 22 y Yarn 4.12.

## 📚 Documentación

- [Documentación de la entrega](docs/entrega.md): arquitectura, decisiones de implementación, diseño, accesibilidad, pruebas, limitaciones y uso de inteligencia artificial.
- [Guía de demostración](docs/demo-guide.md): catálogo de productos, códigos de prueba y escenarios para comprobar el funcionamiento.

## ℹ️ Alcance de la demo

La aplicación utiliza un catálogo de 20 productos de ejemplo y simula el flujo de una venta. No dispone de base de datos, persistencia entre recargas, integración con dispositivos de pago ni impresión física de tickets.

Los detalles de las funcionalidades simuladas y sus limitaciones están explicados en la [documentación de la entrega](docs/entrega.md).

## 📄 Licencia

El código y los materiales de este proyecto están sujetos a los derechos indicados en el fichero [LICENSE](LICENSE).

La publicación del repositorio permite su revisión en el contexto de la prueba técnica, pero no autoriza su copia, reutilización o distribución.