# Entrega

**Diseño:** [supermarket-checkout – Figma](https://www.figma.com/design/Sd9ppmpNXQLRxCiEqY3WAE/supermarket-checkout).

**Código:** implementación React disponible en este repositorio. Para instalar y ejecutar el proyecto, consulta el [README](../README.md).

## Descripción

La aplicación reproduce el flujo principal de una caja de supermercado en una única pantalla. La idea es que la persona que está en caja pueda introducir productos, revisar la venta, modificar cantidades y realizar el cobro sin tener que cambiar de vista.

La interfaz da prioridad a la lectura rápida del importe, la identificación de los productos y el acceso a las acciones principales.

## Funcionamiento

Los productos se localizan introduciendo manualmente su código en el campo de búsqueda. El campo admite códigos de 13 dígitos y ofrece sugerencias a medida que se introducen.

Al completar el código se habilita la acción de añadir. Antes de buscar el producto en el catálogo, se comprueba el dígito de control EAN-13. Los códigos con un dígito de control incorrecto y los códigos válidos que no están en el catálogo muestran mensajes diferentes.

Cuando se añade un producto que ya está en la venta, se incrementa su cantidad en lugar de crear otra línea. Desde el listado también se pueden modificar cantidades, eliminar productos (con opción de deshacer la acción) o vaciar la venta.

Para finalizar es necesario seleccionar un método de pago: efectivo, tarjeta o ticket restaurante. Una vez seleccionado, se habilita el botón de cobro. Durante el envío se muestra el estado de carga y, cuando la operación termina correctamente, aparece el resumen de la venta y la opción de iniciar otra.

Si la operación falla, el contenido de la venta se mantiene para que pueda volver a intentarse.

## Decisiones de implementación

La pantalla mantiene en una misma vista la entrada de productos, el contenido de la venta, el importe total y las opciones de cobro. Así se evita que las acciones principales queden repartidas en diferentes pantallas.

También he tenido en cuenta algunos casos habituales durante una venta:

- Los productos repetidos se agrupan en una misma línea y se actualiza su cantidad.
- Las cantidades y los importes se validan antes de completar la operación.
- Los precios se representan en céntimos para evitar problemas de precisión en los cálculos monetarios.
- El servidor vuelve a calcular los importes a partir del catálogo y las cantidades recibidas. El cliente no determina el total definitivo de la venta.
- Se evita el envío duplicado de una misma operación mientras se está procesando.
- Si falla el cobro, no se vacía el carrito.

La validación del código distingue entre un formato o dígito de control incorrecto y un producto que simplemente no existe en el catálogo. De esta forma, los mensajes permiten identificar mejor qué debe corregirse.

## Resoluciones y adaptación

He tomado como referencia varios tamaños de viewport para revisar cómo se distribuyen los elementos y cuánto espacio queda disponible para las acciones principales.

| Resolución | Motivo |
|---|---|
| 1024 × 768 | Tamaño mínimo de referencia. Permite comprobar que la información esencial y las acciones de cobro siguen siendo accesibles en un espacio reducido. |
| 1280 × 800 | Permite revisar el comportamiento con algo más de altura y un ancho todavía ajustado. |
| 1366 × 768 | Sirve como referencia para una composición panorámica, con espacio horizontal para distribuir la venta y el área de cobro. |
| 1920 × 1080 | Permite comprobar cómo se aprovecha el espacio adicional sin perder la jerarquía visual ni dejar los elementos demasiado separados. |

También se ha tenido en cuenta la orientación vertical, ya que la proporción de la pantalla puede cambiar según el soporte utilizado.

Los botones y controles principales tienen un área de interacción de al menos 48 píxeles, pensando en su utilización mediante pantallas táctiles.

## Funcionalidades simuladas y alcance

La prueba se centra en la interfaz y en el flujo de una venta. Algunas partes representan el funcionamiento de un puesto de caja, pero no están conectadas a los dispositivos o servicios reales de un supermercado.

### Catálogo y códigos de producto

El catálogo contiene 20 productos con datos de demostración. Los códigos utilizan el formato EAN-13 y tienen el dígito de control calculado correctamente. Todos parten del prefijo 200, dentro del rango 20–29 reservado por GS1 para números de circulación restringida. Se utilizan únicamente como identificadores de prueba; no están asociados a productos comerciales reales ni dados de alta como referencias globales de producto.

La introducción de códigos se realiza manualmente. No se ha implementado integración con lectores físicos de códigos de barras ni lectura mediante la cámara del dispositivo.

### Métodos de pago

Se pueden seleccionar efectivo, tarjeta o ticket restaurante. La selección interviene en el flujo de cobro de demostración, pero no hay conexión con un datáfono, una pasarela de pago ni un cajón de efectivo. No se procesa ningún pago real.

### Ticket e impresión

El número de ticket es fijo (`1042`), no se genera una numeración correlativa. El indicador de impresión muestra «Papel cero», pero no se genera un documento ni se envía ningún trabajo a una impresora.

### Datos del puesto

Los valores «Caja 3» y «Cajero 12» son datos fijos de demostración. No hay autenticación de usuarios ni gestión de turnos.

### Persistencia y fechas

La venta se mantiene durante la sesión, pero no se guarda de forma persistente. Al recargar la página se inicia una venta vacía.

La hora de la cabecera utiliza la hora local del dispositivo. La fecha y hora del resumen de venta se establecen al completar el cobro y permanecen fijas en ese resumen.

## Uso de inteligencia artificial

He utilizado Cursor como entorno de desarrollo con asistencia de IA y ChatGPT como apoyo para contrastar decisiones de UX/UI, resolver dudas técnicas y revisar algunos planteamientos. Figma se ha utilizado para definir el diseño y como referencia visual durante la implementación.

Cursor me ha ayudado en distintas partes del desarrollo: desde preparar parte de la estructura inicial del proyecto y trabajar en los componentes de React hasta desarrollar la API de la prueba, incluyendo los endpoints de consulta de productos y registro de ventas. También lo he utilizado para revisar código, resolver problemas durante la implementación y preparar pruebas automatizadas.

Los escenarios y criterios que debían cubrirse en las pruebas los definí a partir de los requisitos de la aplicación. Utilicé IA como apoyo para trasladar parte de esos casos a pruebas automatizadas y revisar su cobertura. Después ejecuté las comprobaciones y revisé los resultados.

La IA ha sido una herramienta de apoyo durante el desarrollo, pero he revisado las propuestas y los resultados antes de incorporarlos a la entrega.
