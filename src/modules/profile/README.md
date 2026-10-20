# Módulo de Perfil (Profile Module) - NestJS

Este módulo forma parte de la API desarrollada en NestJS y proporciona los endpoints necesarios para gestionar la consulta y actualización de la información del usuario autenticado.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Estructura del Módulo](#-estructura-del-módulo)
- [Endpoints de la API](#-endpoints-de-la-api)
- [DTOs y Validaciones](#-dtos-y-validaciones)
- [Pruebas Unitarias](#-pruebas-unitarias)
- [Ejecución de las Pruebas](#-ejecución-de-las-pruebas)

---

## 🚀 Características

- **Autenticación Protegida:** Todos los endpoints requieren un token JWT válido (`JwtAuthGuard`).
- **Decorador Personalizado:** Extracción segura del usuario activo mediante `@CurrentUser()`.
- **Validación de Datos:** Uso de `class-validator` y `class-transformer` para sanitizar las peticiones.
- **Documentación Swagger:** Decoradores OpenAPI integrados para generación automática de la especificación API.
- **Cobertura de Pruebas:** Suite de pruebas unitarias implementada con Jest para DTOs y Controladores.

---

## 📂 Estructura del Módulo

```text
src/modules/profile/
├── dto/
│   ├── update-profile.dto.ts
│   └── update-profile.dto.spec.ts
├── profile.controller.ts
└── profile.controller.spec.ts
```

---

## 🔑 Endpoints de la API

| Método  | Ruta       | Descripción                                     | Autenticación  |
| :------ | :--------- | :---------------------------------------------- | :------------- |
| `GET`   | `/profile` | Consulta la información del usuario en sesión   | JWT (`Bearer`) |
| `PATCH` | `/profile` | Actualiza la información del perfil del usuario | JWT (`Bearer`) |

---

## 📝 DTOs y Validaciones

### `UpdateProfileDto`

Permite la actualización parcial del perfil. Todos los campos son opcionales.

| Campo      | Tipo     | Reglas de Validación                                           | Requerido |
| :--------- | :------- | :------------------------------------------------------------- | :-------- |
| `name`     | `string` | Debe ser texto (`@IsString`)                                   | No        |
| `phone`    | `string` | Debe ser texto (`@IsString`)                                   | No        |
| `password` | `string` | Debe ser texto y tener al menos 6 caracteres (`@MinLength(6)`) | No        |

---

## 🧪 Pruebas Unitarias

El módulo cuenta con dos conjuntos principales de pruebas unitarias:

### 1. Validación de DTO (`update-profile.dto.spec.ts`)

Verifica que las reglas de negocio y restricciones aplicadas por `class-validator` funcionen correctamente:

- [x] Permite DTOs vacíos ya que todos sus campos son opcionales.
- [x] Valida con éxito datos bien formados.
- [x] Retorna mensajes de error personalizados cuando un tipo de dato es erróneo (`name` o `phone` no son texto).
- [x] Rechaza contraseñas con longitud menor a 6 caracteres.

### 2. Controlador de Perfil (`profile.controller.spec.ts`)

Garantiza el comportamiento aislado del `ProfileController` mediante el uso de mocks para `CustomersService`:

- [x] Instanciación correcta del controlador.
- [x] `getProfile`: Llama a `CustomersService.findOne` con el ID extraído del usuario autenticado y retorna el perfil correspondiente.
- [x] `updateProfile`: Llama a `CustomersService.updateProfile` enviando el ID del usuario y el objeto DTO con la información actualizada.

---

## 🛠️ Ejecución de las Pruebas

Para ejecutar la suite de pruebas con Jest, utiliza los siguientes comandos en la terminal:

```bash
# Ejecutar todas las pruebas unitarias
npm run test

# Ejecutar únicamente las pruebas asociadas al módulo de perfil
npm run test -- profile

# Ejecutar las pruebas en modo watch (observador)
npm run test:watch -- profile

# Generar reporte de cobertura
npm run test:cov
```
