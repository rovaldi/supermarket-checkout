# supermarket-checkout

Aplicación de punto de venta para un supermercado, desarrollada como prueba técnica. Permite introducir o escanear códigos de producto, gestionar una venta y simular el cobro desde una única pantalla.

El catálogo y los datos utilizados son de demostración.

La aplicación publicada está en [supermarket-checkout-rob.vercel.app](https://supermarket-checkout-rob.vercel.app/).

Para conocer las decisiones de implementación y qué funcionalidades están simuladas, consulta la [documentación de la entrega](docs/entrega.md). Para probar la aplicación, tienes una [guía de demostración](docs/demo-guide.md) con los códigos del catálogo y algunos casos de prueba.

## Requisitos

- Node.js 22.
- Yarn 4. La versión está declarada en `package.json` mediante `packageManager` y se gestiona con Corepack.

## Instalación y arranque

Desde la raíz del proyecto:

```bash
corepack enable
yarn install
yarn dev
```

Vite mostrará en la terminal la dirección local desde la que puedes acceder a la aplicación.

La configuración de desarrollo también permite ejecutar localmente las funciones de `api/` desde Vite. No es necesario configurar un archivo de entorno para probar la aplicación.

## API

Puedes probar los endpoints desde la terminal mientras el servidor de desarrollo está en ejecución.

**Consultar un producto por código:**

```bash
curl "http://127.0.0.1:5173/api/products?code=2000000750026"
```

**Buscar productos por código:**

```bash
curl "http://127.0.0.1:5173/api/products?q=200"
```

**Registrar una venta de demostración:**

```bash
curl -X POST "http://127.0.0.1:5173/api/sales" \
  -H "Content-Type: application/json" \
  -d '{"paymentMethod":"efectivo","lines":[{"code":"2000000750019","quantity":1}]}'
```

Los ejemplos utilizan el puerto predeterminado de Vite (`5173`). Si está ocupado, utiliza el puerto que indique la terminal.

## Comprobaciones

El proyecto incluye los siguientes comandos:

```bash
yarn lint
yarn typecheck
yarn typecheck:tests
yarn test
yarn build
```

`yarn test` ejecuta las pruebas con Vitest. `yarn build` comprueba los tipos mediante `tsc -b` y genera la compilación de producción con Vite.

## Derechos de uso

© 2026 Roberto Valcárcel. Todos los derechos reservados. Consulta el archivo [LICENSE](LICENSE) para conocer las condiciones de uso del proyecto.