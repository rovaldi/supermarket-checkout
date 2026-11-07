# Guía de demostración

Esta guía recoge los códigos disponibles en el catálogo y algunos escenarios para comprobar el funcionamiento de la aplicación.

## 1. Acceso

Puedes probar la aplicación desde:

**[Supermarket Checkout – Demo](https://supermarket-checkout-rob.vercel.app/)**

También puedes ejecutarla localmente siguiendo las instrucciones del [README](../README.md).

La venta comienza vacía y no es necesario configurar ningún dato adicional.

## 2. Catálogo de productos

El catálogo incluye 20 productos de demostración.

Los códigos utilizan el formato EAN-13 y tienen calculado correctamente su dígito de control. Todos utilizan el prefijo 200 y son identificadores creados exclusivamente para esta prueba, no referencias comerciales registradas.

| Producto | Código EAN-13 | Precio |
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

## 3. Escenarios de demostración

### Añadir productos

1. Introduce `2000000750019` en el campo de código.
2. Comprueba que el botón «Añadir» se habilita al completar los 13 dígitos.
3. Añade el producto.
4. Comprueba que aparece en el listado y que el total se actualiza.

### Repetir un producto

1. Añade `2000000750019`.
2. Introduce nuevamente el mismo código.
3. Comprueba que se incrementa la cantidad de la línea existente, sin duplicar el producto.

### Autocompletado

1. Introduce los primeros tres dígitos de un código, por ejemplo `200`.
2. Comprueba que aparecen las sugerencias del catálogo.
3. Utiliza las flechas del teclado para desplazarte por ellas.
4. Selecciona un producto y comprueba que su código se incorpora al campo.
5. Utiliza Escape para cerrar la lista.

### Modificar cantidades

1. Añade un producto.
2. Incrementa su cantidad.
3. Comprueba que el importe de la línea y el total se actualizan.
4. Intenta introducir una cantidad vacía, cero o decimal.
5. Comprueba que se rechaza el valor y se restaura el anterior.

### Eliminar productos

1. Añade uno o varios productos.
2. Elimina una línea.
3. Comprueba que desaparece del listado y que aparece la opción de deshacer.
4. Utiliza la opción para recuperar la línea eliminada.

### Vaciar la venta

1. Añade varios productos.
2. Selecciona «Vaciar venta».
3. Comprueba que aparece una confirmación.
4. Confirma la acción y verifica que el carrito queda vacío.

### Completar una venta

1. Añade uno o varios productos.
2. Selecciona un método de pago.
3. Comprueba que se habilita el botón de cobro.
4. Pulsa «Cobrar».
5. Comprueba el estado «Cobrando…».
6. Verifica que aparece el resumen de venta completada y la opción de iniciar otra venta.

### Iniciar una nueva venta

Después de completar el cobro, utiliza la opción de nueva venta y comprueba que el carrito vuelve a estar vacío.

## 4. Casos de validación

También se pueden probar los siguientes casos para comprobar el tratamiento de errores.

| Entrada | Resultado esperado |
|---|---|
| Menos de 13 dígitos | «Añadir» permanece desactivado. |
| `2000000750010` | Se informa de que el código no es válido por su dígito de control. |
| `2000000750996` | Código EAN-13 válido, pero producto inexistente en el catálogo. |
| Código con letras | No se permite añadir el producto. |

**Código válido que no existe en el catálogo:**

```text
2000000750996
```

Este código permite comprobar que la validación EAN-13 y la búsqueda en el catálogo son operaciones diferenciadas.

## 5. Comprobación de la API

Si ejecutas el proyecto localmente, puedes consultar directamente los endpoints desde la terminal.

**Buscar un producto por código:**

```bash
curl "http://127.0.0.1:5173/api/products?code=2000000750019"
```

**Buscar productos por prefijo:**

```bash
curl "http://127.0.0.1:5173/api/products?q=200"
```

**Registrar una venta de demostración:**

```bash
curl -X POST "http://127.0.0.1:5173/api/sales" \
  -H "content-type: application/json" \
  -d '{
    "paymentMethod": "efectivo",
    "lines": [
      {
        "code": "2000000750019",
        "quantity": 1
      }
    ]
  }'
```

La API utiliza el catálogo del servidor para obtener los precios y calcular el importe de la venta.

El puerto puede variar si Vite detecta que el 5173 está ocupado. En ese caso, utiliza el que indique la terminal.

## 6. Consideraciones

- Los códigos deben introducirse manualmente.
- No hay integración con lectores físicos ni cámara.
- Los productos y sus precios son datos de demostración.
- No se realizan pagos reales.
- El ticket utiliza una numeración fija.
- No hay impresión física ni persistencia de ventas.
- Al recargar la aplicación se inicia una venta vacía.

Para conocer más detalles sobre la arquitectura, las decisiones de implementación y las funcionalidades simuladas, consulta la [documentación de la entrega](entrega.md).