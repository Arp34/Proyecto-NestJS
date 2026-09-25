# Módulo de Reservas (`reservations`)

Módulo de NestJS para gestionar las reservas de mesas del restaurante. Expone un CRUD completo documentado con Swagger y valida las reglas de negocio en el service.

## Estructura

```
src/modules/reservations/
├── dto/
│   ├── create-reservation.dto.ts
│   └── update-reservation.dto.ts
├── entities/
│   └── reservation.entity.ts
├── reservations.controller.ts
├── reservations.service.ts
├── reservations.module.ts
└── README.md
```

## Entity: `Reservation`

Tabla: `reservations`

| Campo        | Tipo                  | Descripción                                             |
| ------------ | --------------------- | ------------------------------------------------------- |
| `id`         | `uuid`                | Identificador (autogenerado).                           |
| `customer_id`| `uuid`                | Cliente que hace la reserva.                            |
| `table_id`   | `uuid` (nullable)     | Mesa asignada. Es opcional.                             |
| `date`       | `date` (`string`)     | Fecha de la reserva, formato `YYYY-MM-DD`.              |
| `time`       | `time` (`string`)     | Hora de la reserva, formato `HH:mm`.                    |
| `guests`     | `int`                 | Cantidad de personas.                                   |
| `status`     | `enum`                | Estado. Por defecto `PENDING`.                          |
| `notes`      | `text` (nullable)     | Notas adicionales.                                      |
| `created_at` | `Date`                | Fecha de creación (autogenerada).                       |
| `updated_at` | `Date`                | Fecha de última actualización (autogenerada).           |

### Estados (`ReservationStatus`)

`PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`

> Las relaciones `@ManyToOne` hacia `Customer` y `Table` están comentadas en la entity. Por eso no existe llave foránea en la base de datos y la existencia de cliente y mesa se valida en el service.

## Endpoints

| Método   | Ruta                | Descripción                    | Respuestas                     |
| -------- | ------------------- | ------------------------------ | ------------------------------ |
| `POST`   | `/reservations`     | Crear una reserva              | `201`, `400`, `404`, `409`     |
| `GET`    | `/reservations`     | Listar todas las reservas      | `200`                          |
| `GET`    | `/reservations/:id` | Obtener una reserva por ID     | `200`, `400`, `404`            |
| `PATCH`  | `/reservations/:id` | Actualizar una reserva         | `200`, `400`, `404`, `409`     |
| `DELETE` | `/reservations/:id` | Eliminar una reserva           | `204`, `400`, `404`            |

Los parámetros `:id` se validan con `ParseUUIDPipe`: un ID que no sea UUID responde `400` en lugar de llegar a la base de datos.

La documentación interactiva está en Swagger (`/api` o la ruta configurada en `main.ts`).

## Reglas de negocio (service)

Al crear una reserva:

1. La fecha y hora no pueden estar en el pasado (`400`).
2. El cliente debe existir (`404`).
3. Si se envía `table_id`:
   - La mesa debe existir (`404`).
   - La capacidad de la mesa debe alcanzar para los `guests` (`409`).
   - No puede haber otra reserva de esa mesa, en la misma fecha y hora, que no esté `CANCELLED` (`409`).

Al actualizar se aplican las mismas validaciones sobre los valores finales (lo que ya tenía la reserva más lo que cambia), excluyendo la propia reserva del chequeo de conflicto.

Al consultar, actualizar o eliminar un ID inexistente se responde `404`.

## Problemas resueltos

### 1. Marcadores de conflicto de merge dentro del código

**Síntoma:** al compilar, 21 errores `TS1185: Merge conflict marker encountered` en `app.module.ts`, `create-category.dto.ts` y `table.entity.ts`.

**Causa:** los marcadores `<<<<<<< HEAD`, `=======` y `>>>>>>> origin/feature/customers` habían quedado dentro de los archivos. `git status` no mostraba archivos en conflicto, lo que indicaba que los marcadores ya estaban commiteados y no había un merge en curso.

**Solución:**
- `create-category.dto.ts`: se conservaron las líneas de `origin/feature/customers` (`import { Transform }` y los dos `@Transform(({ value }) => value?.trim())`).
- `app.module.ts`: se juntaron los imports y los módulos de ambas ramas (`ReservationsModule`, `CategoriesModule`, `CustomersModule`, `TablesModule`) sin duplicar `CategoriesModule`.
- `table.entity.ts`: se unificaron los imports de `typeorm` y se eligió un solo nombre para la columna de actualización.
- Se verificó con `grep -rn -E "^(<<<<<<<|=======|>>>>>>>)" src/` y el compilador quedó en `Found 0 errors`.

**Prevención:** antes de cada commit, ejecutar ese mismo `grep`.

### 2. Nombre inconsistente `updateAt` / `updatedAt`

**Causa:** la entity `Table` tenía `updatedAt` en una rama y `updateAt` en la otra. Las entities `Category` y `Customer` ya usaban `updatedAt`.

**Solución:** se unificó en `updatedAt` en `table.entity.ts` y en el README del módulo de mesas (`sed -i 's/`updateAt`/`updatedAt`/'`).

**Nota:** con `synchronize: true`, renombrar una propiedad cambia la columna en la base de datos. En `Table` el campo `createAt` sigue sin la "d"; si se renombra, hacerlo en todo el proyecto a la vez.

### 3. Error de conexión: `la autentificación password falló para el usuario «postgres»` (código `28P01`)

**Síntoma:** Nest arrancaba pero no conectaba a la base de datos, y `docker compose up -d` fallaba con `bind: address already in use` en el puerto 5432.

**Causa:** había un PostgreSQL instalado localmente (verificado con `sudo ss -tlnp | grep 5432`) ocupando el puerto 5432. Nest conectaba a ese servidor y no al contenedor `restaurant_db`, por lo que la contraseña del `docker-compose.yml` no aplicaba.

**Solución (elegir una):**
- Detener el PostgreSQL local (`sudo systemctl stop postgresql`) y levantar Docker.
- O mover el contenedor a otro puerto (`"5433:5432"` en `docker-compose.yml` y `DB_PORT=5433` en `.env`).

En ambos casos, `DB_USERNAME`, `DB_PASSWORD` y `DB_DATABASE` del `.env` deben coincidir con `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB` del compose, y hay que reiniciar Nest después de editar el `.env`.

### 4. Controller: documentación Swagger incorrecta y sin validación de UUID

**Problemas:**
- El summary de `findOne` decía "todas las reservas" y la respuesta 200 decía "Reserva **no** encontrada correctamente".
- Un ID inválido llegaba a la base de datos y devolvía `500`.
- Faltaba documentar los errores `400` y `409`.

**Solución:** se corrigieron los textos, se agregó `ParseUUIDPipe` a `findOne`, `update` y `remove`, y se añadieron `type: Reservation` y las respuestas `400` y `409` en Swagger.

### 5. Service: errores que no se cumplían

| Problema                                                              | Solución                                                             |
| --------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `findOne` devolvía `null` con status 200 si el ID no existía.         | Lanza `NotFoundException`.                                           |
| `update` usaba `repository.update`: devolvía un `UpdateResult`, no la reserva, y no validaba nada. | Busca la reserva, valida y la guarda con `save`.       |
| `remove` no fallaba con un ID inexistente.                            | Revisa `result.affected` y lanza `NotFoundException`.                |
| Un `customer_id` o `table_id` inexistente se guardaba sin error (no hay llaves foráneas). | Se valida que existan antes de guardar.          |
| No se validaba la capacidad de la mesa.                               | `409` si `guests` supera `capacity`.                                 |
| No se rechazaban fechas pasadas.                                      | `400` si la fecha y hora ya pasaron.                                 |

### 6. Errores de tipos con `table_id` y `date`

- **`date`:** en la entity es `string`, y el helper usaba `date instanceof Date`, que TypeScript rechaza sobre un `string` (TS2358). Se tipó `date` y `time` como `string`.
- **`table_id`:** es opcional (`string | undefined`) y no cabía en los helpers que pedían `string`. Además, TypeORM **ignora** las propiedades `undefined` dentro de un `where`, así que una reserva sin mesa habría comparado solo fecha y hora y dado falsos `409`. Ahora las validaciones de mesa solo se ejecutan si `table_id` viene en la petición.
- El chequeo de conflicto ignora las reservas `CANCELLED`, porque una reserva cancelada libera la mesa.

## Configuración necesaria

El service inyecta los repositorios de `Table` y `Customer`, por lo que deben registrarse en `reservations.module.ts`:

```ts
TypeOrmModule.forFeature([Reservation, Table, Customer])
```

Para que las validaciones de los DTOs se ejecuten, `main.ts` debe tener:

```ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
```

## Pendiente / mejoras futuras

- **Solapamiento de horarios:** hoy el conflicto solo se detecta si la reserva es exactamente a la misma hora. Falta definir cuánto dura una reserva (por ejemplo 2 horas) y comparar rangos.
- **Validar el formato de `time`:** el DTO solo usa `@IsString()`. Sugerido: `@Matches(/^([01]\d|2[0-3]):[0-5]\d$/)`.
- **Corregir el Swagger de `notes`** en `create-reservation.dto.ts`: tiene la descripción "Estado de la reserva" y el ejemplo `PENDING`, copiados por error.
- **Reactivar las relaciones** `@ManyToOne` con `Customer` y `Table` para tener llaves foráneas reales.
- **Endpoints adicionales:** cancelar una reserva (`PATCH /reservations/:id/cancel`), cambiar estado, consultar disponibilidad, y filtros con paginación en `GET /reservations`.
- **Actualizar el estado de la mesa** (`RESERVED` / `AVAILABLE`) al crear o cancelar una reserva.