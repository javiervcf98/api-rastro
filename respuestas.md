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
