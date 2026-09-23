# Tables Module

A **NestJS** module for managing restaurant tables. It exposes a REST API with full CRUD operations (create, list, get, update, delete) and persists data through **TypeORM**.

## Module contents

```
tables/
├── dto/
│   ├── create-table.dto.ts   # Validation rules for creating a table
│   └── update-table.dto.ts   # Partial DTO for updates (PATCH)
├── entities/
│   └── table.entity.ts       # TypeORM "Table" entity
├── tables.controller.ts      # HTTP routes for the /tables resource
├── tables.service.ts         # Business logic and data access
├── tables.module.ts          # Nest module definition
├── tables.controller.spec.ts # Controller unit test
└── tables.service.spec.ts    # Service unit test
```

## Data model (`Table`)

| Field      | Type                                     | Description                                    |
|------------|--------------------------------------------|-------------------------------------------------|
| `id`       | `uuid`                                     | Unique identifier, auto-generated.                |
| `number`   | `int` (unique)                              | Table number.                                    |
| `capacity` | `int`                                        | Number of people the table can seat.             |
| `zone`     | `varchar` (max 50)                          | Restaurant zone (e.g. "Terrace").                 |
| `status`   | `enum`: `available` \| `occupied` \| `reserved` | Current table status. Defaults to `available`.   |
| `createAt` | `Date`                                       | Creation timestamp (auto-generated).              |
| `updateAt` | `Date`                                       | Last update timestamp (auto-generated).           |

> Note: the entity maps to the `tables` table (plural) in the database, since `table` is often a reserved SQL keyword.

## Endpoints

All routes live under the `/tables` prefix.

| Method   | Route         | Description                     | Responses                                        |
|----------|---------------|-----------------------------------|----------------------------------------------------|
| `POST`   | `/tables`     | Creates a new table                | `201` created · `400` invalid data · `409` duplicate table number |
| `GET`    | `/tables`     | Lists all tables                   | `200` OK                                            |
| `GET`    | `/tables/:id` | Retrieves a table by ID (UUID)     | `200` OK · `404` not found                          |
| `PATCH`  | `/tables/:id` | Partially updates a table          | `200` updated · `404` not found                     |
| `DELETE` | `/tables/:id` | Deletes a table                    | `200` deleted · `404` not found                     |

Interactive documentation for these endpoints is auto-generated via **Swagger** (`@nestjs/swagger`).

### Validation rules on create/update

- `number`: positive integer, required and unique.
- `capacity`: positive integer, required.
- `zone`: required string, max 50 characters.
- `status`: optional; if provided, must be `available`, `occupied` or `reserved`. Defaults to `available` when omitted.

In `update-table.dto.ts` all these fields become optional (`PartialType`), since an update may only touch some of them.

## Business rules

- **Unique table number**: when creating a table, the service checks that no other table has the same `number`; if one exists, it throws a `409 Conflict`.
- **Existence checks**: `findOne`, `update` and `remove` verify the table exists and throw `404 Not Found` otherwise.
- **Update via `preload`**: `update` uses `tableRepository.preload` to merge the DTO changes into the existing entity before saving.

## Usage

1. Register the module in the app's root module (or wherever appropriate):

```ts
import { TablesModule } from './tables/tables.module.js';

@Module({
  imports: [TablesModule /* ...other modules */],
})
export class AppModule {}
```

2. Make sure `TypeOrmModule` is configured at the app level with the database connection.

3. Run the app and consume the endpoints described above (e.g. via Swagger UI at `/api`, if enabled).

## Tests

The module ships with base unit tests for the controller and service:

```bash
npm run test -- tables
```

## TODO / possible improvements

- Expand test coverage (currently they only check that the service/controller are instantiated).
- Add pagination and filters (by zone or status) to `GET /tables`.
- Add extra business rules, such as preventing deletion of a table that is `occupied` or `reserved`.
