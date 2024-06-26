## Quick start
```
npm install
cd frontend
npm install
npm start
 ```

## Pasos realizados
- Creación del proyecto tomando como base el template de hardhat (después de tener en cuenta y probar con muchas otras opciones las cuales daban muchos problemas con las versiones de las dependencias)
- Creación, compilación y despliegue del contrato que gestiona los viajes
- Creación de la apliacación y los componentes de la aplicación

## Estado actual
- La aplicación solicita la conexión con la cartera con MetaMask y luego permite ver los viajes y su gastos
- Se pueden crear viajes y añadir participantes
- Se pueden añadir gastos (asignados a la cartera del usuario que pagó el gasto) a los viajes
- Se calcula el balance de cada viaje y se da la opción de pagar la diferencia (solamente tiene la opción el usuario que debe dinero)

## Pasos futuros
- Limitar la visualización de los viajes y gastos solamente a los usuarios que estén asignados (ahora mismo aunque no pueden editarlos, todos pueden verlos)
- Añadir un campo de nombre a los participantes para no tener que identificarlos por la dirección de la cartera
- Exportarla correctamente a Android
- Mejorar la interfaz de usuario
