# Customers Module

## Descripción

El módulo Customers permite administrar los clientes de la aplicación mediante una API REST.

La persistencia de los datos se realiza utilizando TypeORM y PostgreSQL.

## Arquitectura

El módulo está dividido en tres capas principales:

- Controller: recibe las peticiones HTTP y expone los endpoints.
- Service: contiene la lógica de acceso a los datos.
- Entity: representa la estructura de la tabla `customers` en PostgreSQL.

El acceso a la base de datos se realiza mediante el repositorio de TypeORM inyectado en `CustomersService`.

## Entity

La entidad `Customer` representa la tabla `customers`.

El campo `id` utiliza UUID como llave primaria.

Los campos `name` y `phone` son obligatorios, mientras que `email` es opcional.

Los campos `created_at` y `updated_at` son administrados automáticamente por TypeORM.

## DTOs

Los DTOs se utilizan para controlar y validar los datos recibidos por la API.

`CreateCustomerDto` valida:

- `name`: debe ser un texto y no puede estar vacío.
- `phone`: debe ser un texto y no puede estar vacío.
- `email`: es opcional, pero cuando se proporciona debe tener un formato de correo válido.

`UpdateCustomerDto` utiliza `PartialType`, permitiendo actualizar solamente los campos necesarios.

## Swagger

Los endpoints y propiedades de los DTOs están documentados utilizando Swagger.

La documentación interactiva está disponible en:

`/api/docs`