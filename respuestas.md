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
