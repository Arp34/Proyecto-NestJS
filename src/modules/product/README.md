# Módulo Product

Módulo de NestJS que implementa el CRUD de productos (`Product`), usando TypeORM sobre PostgreSQL, con una relación hacia `Category`.

## Estructura del módulo

```
product/
├── dto/
│   ├── create-product.dto.ts
│   └── update-product.dto.ts
├── entities/
│   └── product.entity.ts
├── types/
│   └── interface.ts
├── product.controller.ts
├── product.service.ts
└── product.module.ts
```

- **`product.controller.ts`** — recibe las peticiones HTTP (`GET`, `POST`, `PATCH`, `DELETE`) y las delega al service. No contiene lógica de negocio.
- **`product.service.ts`** — contiene toda la lógica real: crear, buscar, actualizar y eliminar productos usando el `Repository<Product>` de TypeORM.
- **`product.module.ts`** — conecta las piezas anteriores y registra el repositorio de `Product` mediante `TypeOrmModule.forFeature([Product])`.

## Relación con Category

Un producto pertenece a **una** categoría, y una categoría puede tener **muchos** productos (relación `Many-to-One` / `One-to-Many`).

En `product.entity.ts`:

```typescript
@ManyToOne(() => Category, (category) => category.products)
@JoinColumn({ name: "category_id" })
category: Category;
```

- El lado `@ManyToOne` (en `Product`) es el que físicamente guarda la llave foránea en la base de datos.
- `@JoinColumn({ name: "category_id" })` le da a esa columna el nombre `category_id`, en vez del nombre por defecto que TypeORM le habría puesto.
- El lado `@OneToMany` (en `Category`, propiedad `products: Product[]`) no crea ninguna columna — es virtual, TypeORM lo resuelve con una consulta al pedirlo.

**Importante:** `Product` no tiene una columna suelta `category_id: string` declarada como `@Column()`. Esa columna existe en la base de datos (gracias al `@JoinColumn`), pero en el código se accede a través del objeto `category`, no como un campo plano.

## Por qué los DTO están separados así

- **`CreateProductDto`** — define los campos obligatorios para crear un producto, cada uno validado con `class-validator` (`@IsString`, `@Length`, `@IsNumber`, `@IsEnum`, `@IsUrl`, `@IsUUID`). Este DTO es la única puerta de entrada de datos del cliente: si algo no cumple sus reglas, Nest responde con un error 400 antes de que el controller o el service se enteren.
- **`UpdateProductDto`** — se define como `extends PartialType(CreateProductDto)`, lo que convierte automáticamente **todos** los campos en opcionales. Así, un `PATCH` puede mandar solo el campo que cambió (por ejemplo, solo `price`), sin necesidad de repetir el producto completo.

## Por qué la Entity no valida datos

`product.entity.ts` describe **la forma de la tabla** en la base de datos (tipos de columna, longitudes, relaciones) — no valida entradas del usuario. La validación de lo que manda el cliente vive en los DTO, usando `class-validator`. Son dos responsabilidades distintas: la Entity le habla a la base de datos, el DTO le habla al cliente HTTP.

## Lógica del service (resumen)

| Método    | Qué hace                                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `create`  | Construye la entidad con `repository.create()` (incluyendo la categoría vía `category: { id: ... }`) y la persiste con `repository.save()`. |
| `findAll` | Devuelve todos los productos con `repository.find()`.                                                                                       |
| `findOne` | Busca por `id` con `findOneBy()`; lanza `NotFoundException` (404) si no existe.                                                             |
| `update`  | Reutiliza `findOne` para traer el producto, copia los campos nuevos con `repository.merge()`, y guarda con `repository.save()`.             |
| `remove`  | Reutiliza `findOne` (que ya valida existencia) y elimina con `repository.remove()`.                                                         |

# Estado y Disponibilidad del Producto

Este módulo gestiona de forma independiente el ciclo de vida operativo (**status**) y la existencia comercial (**availability**) de los productos dentro de la entidad `Product`.

## 📌 Conceptos Generales

El producto cuenta con dos valores independientes para controlar su comportamiento en la plataforma:

- **`status`**: Indica si el producto está activo o inactivo en el sistema.
- **`availability`**: Indica si el producto cuenta con stock o disponibilidad para la venta.

### Valores por Defecto (Nuevos Productos)

Al crear un nuevo registro en la entidad `Product`, se asignan automáticamente los siguientes estados:

- `status`: `ACTIVE`
- `availability`: `AVAILABLE`

---

## 🛠️ Enums y Tipos de Datos

Ambas propiedades se definen mediante enumeraciones de TypeScript directamente en la entidad:

```typescript
export enum productStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum productAvailability {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
}
```

---

## 🛣️ Nuevos Endpoints

Se han habilitado endpoints específicos de tipo `PATCH` para modificar cada propiedad de manera aislada. **Cambiar el `status` no modifica la `availability`, y viceversa.**

### 1. Actualizar Estado

Modifica únicamente el estado general del producto.

- **Ruta:** `PATCH /product/{id}/status`
- **DTO utilizado:** `UpdateProductStatusDto`
- **Ejemplo de Body:**
  ```json
  {
    "status": "INACTIVE"
  }
  ```

### 2. Actualizar Disponibilidad

Modifica únicamente la disponibilidad comercial del producto.

- **Ruta:** `PATCH /product/{id}/availability`
- **DTO utilizado:** `UpdateProductAvailabilityDto`
- **Ejemplo de Body:**
  ```json
  {
    "availability": "UNAVAILABLE"
  }
  ```

---

## 🔒 Validaciones y DTOs

El sistema utiliza **NestJS** junto con `class-validator` para asegurar la integridad de los datos entrantes:

- **`UpdateProductStatusDto`**: Valida que el estado recibido pertenezca estrictamente al enum `productStatus` mediante el decorador `@IsEnum(productStatus)`.
- **`UpdateProductAvailabilityDto`**: Valida que la disponibilidad recibida pertenezca estrictamente al enum `productAvailability` mediante el decorador `@IsEnum(productAvailability)`.

> ⚠️ **Manejo de Errores:** Si se envía un valor que no pertenece al enum correspondiente, NestJS interceptará la petición y devolverá automáticamente un error **`400 Bad Request`**.
