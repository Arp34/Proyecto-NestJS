
# Categories Module

## Descripción

El módulo `Categories` se encarga de administrar las categorías del menú del restaurante. Permite crear, consultar, actualizar y eliminar categorías mediante una API REST.

El módulo utiliza NestJS, TypeORM, PostgreSQL, class-validator, Jest para pruebas unitarias y Swagger para documentación.

## Estructura del módulo

El módulo sigue la siguiente estructura:

- **Controller:** Recibe las solicitudes HTTP y expone los endpoints de la API.
- **Service:** Contiene la lógica de negocio y se comunica con el repositorio.
- **Entity:** Define la estructura de la tabla `categories` en PostgreSQL.
- **DTOs:** Definen y validan los datos recibidos en las solicitudes.
- **Enum:** Define los estados permitidos para una categoría.

El flujo de una solicitud es:

```text
Controller → Service → Repository → PostgreSQL

```

## Decisiones de diseño

### 1. Identificador UUID

El campo `id` utiliza UUID como identificador único de cada categoría. Se utiliza `ParseUUIDPipe` en los endpoints del controlador para interceptar IDs con formato inválido y retornar un error controlado `400 Bad Request` antes de interactuar con la base de datos.

Se eligió UUID en lugar de un número incremental porque permite generar identificadores únicos y dificulta que los usuarios puedan deducir la cantidad de registros o consultar recursos utilizando IDs consecutivos.

### 2. Nombre único

El campo `name` es obligatorio y tiene una restricción `unique` en la base de datos.

Esto evita que existan varias categorías con el mismo nombre. Además, el DTO valida que el nombre sea un texto, que no esté vacío y que no supere los 100 caracteres.

La restricción de unicidad se mantiene en la base de datos para garantizar que no se creen duplicados, incluso si dos solicitudes llegan al mismo tiempo.

### 3. Descripción opcional

El campo `description` es de tipo `text` y permite valores nulos.

Se definió como opcional porque una categoría puede crearse sin una descripción. Esto permite registrar categorías básicas y añadir información adicional cuando sea necesario.

### 4. Manejo del estado: `ACTIVE` e `INACTIVE`

Se decidió utilizar un **enum llamado `CategoryStatus**` para definir los valores permitidos:

* `ACTIVE`: La categoría está activa y puede utilizarse en el menú.
* `INACTIVE`: La categoría está inactiva y puede conservarse en el sistema sin estar disponible para su uso.

**Reglas de negocio aplicadas al estado:**

* Toda categoría nueva inicia con estado `ACTIVE` por defecto.
* El endpoint de consulta general (`GET /categories`) filtra automáticamente los registros para no mostrar las categorías `INACTIVE` en el menú público.
* Se implementó un endpoint específico (`PATCH /categories/:id/status`) dedicado exclusivamente a la activación o desactivación segura de las categorías.

### 5. DTOs y validaciones

Se utiliza `CreateCategoryDto` para validar los datos al crear una categoría. Las validaciones principales son:

* El nombre debe ser un texto, no puede estar vacío y no puede superar los 100 caracteres.
* La descripción es opcional, pero si se envía debe ser un texto.
* El estado es opcional y solo puede ser `ACTIVE` o `INACTIVE`.

Para actualizar una categoría se utiliza `UpdateCategoryDto`, que hereda de `CreateCategoryDto` mediante `PartialType`.

Para el cambio exclusivo de estado, se creó `UpdateCategoryStatusDto`, el cual exige estrictamente que se envíe el campo status y que este corresponda únicamente a los valores del enum (`ACTIVE` o `INACTIVE`).

### 6. Validación global

Se utiliza `ValidationPipe` de NestJS con las siguientes opciones:

* `whitelist: true`: Elimina las propiedades que no están definidas en el DTO.
* `forbidNonWhitelisted: true`: Rechaza las solicitudes que contienen propiedades no permitidas.
* `transform: true`: Permite transformar los datos recibidos según las configuraciones de los DTOs.

### 7. Manejo de errores y nombres duplicados

El nombre de la categoría debe ser único. En caso de que PostgreSQL detecte un nombre duplicado, el servicio captura el error y devuelve una excepción `ConflictException` (`409 Conflict`).
Las consultas de elementos inexistentes retornan un `NotFoundException` (`404 Not Found`).

## Documentación con Swagger

El controlador utiliza decoradores de Swagger para documentar los endpoints del módulo. La documentación se encuentra disponible en `/api/docs`.

Desde Swagger se pueden consultar y probar las operaciones disponibles:

* `POST /categories`: Crear una categoría.
* `GET /categories`: Obtener todas las categorías activas.
* `GET /categories/:id`: Obtener una categoría por su ID.
* `PATCH /categories/:id`: Actualizar los datos de una categoría.
* `PATCH /categories/:id/status`: Actualizar el estado (Activo/Inactivo) de una categoría.
* `DELETE /categories/:id`: Eliminar una categoría.

## Flujo de funcionamiento

1. El cliente realiza una solicitud HTTP al controlador.
2. El DTO valida los datos recibidos.
3. El controlador envía los datos al servicio.
4. El servicio aplica la lógica de negocio.
5. El repositorio de TypeORM se comunica con PostgreSQL.
6. El resultado se devuelve al cliente mediante el controlador.

## Tecnologías utilizadas

* NestJS
* TypeORM
* PostgreSQL
* Class-validator
* Class-transformer
* Swagger
* TypeScript
* Jest (Pruebas Unitarias)

## Evidencia de Pruebas Unitarias

El módulo cuenta con una suite completa de pruebas unitarias implementada con Jest, garantizando la calidad del software, mockeando las conexiones a la base de datos y cubriendo tanto los casos de éxito como el manejo de excepciones (404, 409).
