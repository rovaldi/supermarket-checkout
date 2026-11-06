# Guía de demostración

Para ejecutar la aplicación, sigue las instrucciones del [README](../README.md).

```bash
yarn install
yarn dev
```

Abre la dirección local que indique Vite. La venta empieza vacía.

## Introducir productos

Puedes escribir los códigos directamente en el campo de producto o utilizar un lector de códigos de barras que funcione como teclado.

El lector introduce el código en el campo como si fuera un teclado. Si el autocomplete muestra una sugerencia, la primera pulsación de Enter la selecciona; después puedes añadir el producto con el botón «Añadir» o con una nueva pulsación de Enter. No se utiliza la cámara del dispositivo.

El catálogo contiene 20 productos de demostración:

| Producto | Código | Precio |
|---|---|---:|
| Leche entera 1 L | `2000000750019` | 0,95 € |
| Pan de barra | `2000000750026` | 0,60 € |
| Huevos (12) | `2000000750033` | 2,35 € |
| Aceite de oliva 1 L | `2000000750040` | 8,90 € |
| Arroz 1 kg | `2000000750057` | 1,25 € |
| Tomate triturado | `2000000750064` | 0,85 € |
| Agua 1,5 L | `2000000750071` | 0,40 € |
| Yogur natural (4) | `2000000750088` | 1,10 € |
| Café molido 250 g | `2000000750095` | 3,45 € |
| Plátanos 1 kg | `2000000750101` | 1,99 € |
| Zumo de naranja 1 L | `2000000750118` | 1,45 € |
| Queso fresco 250 g | `2000000750125` | 2,75 € |
| Manzanas 1 kg | `2000000750132` | 1,89 € |
| Pan integral | `2000000750149` | 1,15 € |
| Atún en aceite | `2000000750156` | 1,65 € |
| Espaguetis 500 g | `2000000750163` | 0,89 € |
| Detergente ropa 1,5 L | `2000000750170` | 3,99 € |
| Papel de cocina | `2000000750187` | 1,59 € |
| Galletas María 800 g | `2000000750194` | 1,35 € |
| Leche semidesnatada 1 L | `2000000750200` | 0,92 € |

## Códigos para comprobar la validación

Además de los productos del catálogo, puedes utilizar estos dos ejemplos:

| Caso | Código | Resultado esperado |
|---|---|---|
| Dígito de control incorrecto | `2000000750027` | La aplicación muestra un error de código no válido y no añade el producto. |
| EAN-13 válido, pero fuera del catálogo | `2000000750996` | La aplicación indica que no se ha encontrado ningún producto. |

El segundo código tiene una longitud y un dígito de control correctos, pero no corresponde a ninguno de los productos disponibles.

## Otros casos que puedes probar

### Carrito

- Añadir el mismo producto varias veces: se incrementa la cantidad de una única línea.
- Modificar manualmente la cantidad de un producto.
- Eliminar un producto y utilizar la opción de deshacer.
- Vaciar la venta y comprobar que el carrito queda vacío.
- Comprobar cómo se actualizan los importes al cambiar las cantidades.

### Cobro

- Intentar cobrar sin seleccionar un método de pago: el botón permanece deshabilitado.
- Seleccionar efectivo, tarjeta o ticket restaurante.
- Completar una venta y consultar el resumen.
- Iniciar una nueva venta desde el resumen de la anterior.

Los métodos de pago y la impresión del ticket están simulados. No se realiza ningún cobro real ni se envía ningún documento a una impresora.

Los códigos del catálogo son datos de demostración, no referencias comerciales de productos reales.