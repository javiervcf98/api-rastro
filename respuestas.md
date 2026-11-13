//EJERCICIO 0//
PRUEBA DE PUSH DIRECTO A MAIN:
Al intentar hacer push a main GitHub lo rechaza:
-remote: error: GH013: Repository rule violations found for refs/heads/main.
-remote: - Changes must be made through a pull request.

La regla de "proteger main" obliga a cambiar main solo mediante una PR y con los checks "htmlint" y "lint" en verde.

//EJERCICIO 1//
¿Qué código recibes con MongoDB parado?
Recibo un **500** con `{ "error": "Error interno del servidor" }`. Ha
respondido el middleware de errores (el punto 5 de `index.ts`): el `ping`
a MongoDB lanza un error a los 5 segundos, Express lo pasa a ese
middleware, que escribe el error completo en la terminal y responde al
cliente solo con un mensaje genérico.

//EJERCICIO 2//
¿Por qué `?price=380` no encuentra el iPhone?
Porque todo lo que llega en una URL es texto: `req.query` es
`{ price: "380" }`, con el precio como texto. En MongoDB el precio está
guardado como número (`380`), y MongoDB no considera iguales un texto y
un número, así que no encuentra nada (igual que la lámpara del B4.4).
Con `category` funciona porque la categoría también está guardada como
texto.

//EJERCICIO 3//
¿Por qué la API ignora `views` y `status`?

Porque esos valores los tiene que decidir la API, no el cliente: un anuncio
nuevo siempre empieza AVAILABLE y con 0 visitas. Cualquiera puede enviar
peticiones con Postman, así que si la API guardara lo que llega, alguien
podría publicar un anuncio con 9999 visitas para que parezca popular, o
marcarlo como SOLD o RESERVED saltándose el proceso de ofertas. Por eso
el anuncio se construye campo a campo y nunca se guarda `req.body` tal cual.

//EJERCICIO 4//
¿Debe el PATCH cambiar también el precio copiado en la oferta?

No. El precio guardado en la oferta es una foto del momento: es el precio
que tenía el iPhone cuando Sara hizo su oferta (380 €). Si lo cambiáramos
a 350 €, parecería que Sara pidió otra rebaja distinta y perderíamos esa
información. Es como el precio de una línea de pedido en Furniro: si el
producto cambia de precio después, el pedido ya hecho no cambia.

//EJERCICIO 5//
¿Por qué ofertar por un anuncio vendido es 409 y no 400?

Porque la petición está bien hecha: los ids son correctos y existen, y el
importe es válido. El problema no es lo que envía el cliente, sino el estado
actual del anuncio (SOLD). Si el anuncio estuviera AVAILABLE, la misma
petición daría 201. El 400 es para peticiones mal hechas que el cliente
tiene que corregir; el 409, para peticiones correctas que chocan con el
estado actual.

//EJERCICIO 6//
¿Qué comprueba MongoDB y qué he comprobado yo?
MongoDB comprueba lo que se le pide con índices únicos: por ejemplo, el
índice único sobre `email` impide dos usuarios con el mismo email, y nunca
deja repetir un `_id`.

Todo lo demás lo he tenido que comprobar yo en el código, porque MongoDB lo
guardaría sin quejarse: por ejemplo, que el `sellerId` de un anuncio nuevo
exista en `users` (el vendedor fantasma) o que el `price` sea un número y
no un texto (la lámpara). También que los campos obligatorios estén y que
el anuncio esté AVAILABLE antes de aceptar una oferta.