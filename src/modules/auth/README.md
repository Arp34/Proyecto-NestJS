# 🔐 Auth Module

Módulo de autenticación y gestión de credenciales para la aplicación NestJS. Proporciona flujos seguros de inicio de sesión, recuperación de contraseña y gestión de tokens JWT.

---

## 🛠️ Características Principales

- **Autenticación con JWT:** Generación y firma asíncrona de tokens de acceso mediante `JwtService`.
- **Estrategia JWT:** Validación de encabezados Bearer utilizando `passport-jwt` (`JwtStrategy`).
- **Seguridad de Contraseñas:** Cifrado y verificación de hashes utilizando `bcrypt`.
- **Protección Anti-Enumeración:** Respuestas genéricas en el flujo de recuperación de contraseña para prevenir la recolección de correos válidos.
- **Control de Estado de Cuenta:** Verificación explícita del estado del cliente (`CustomerStatus.ACTIVE`) previo al inicio de sesión.
- **Transformación de Objetos:** Sanitización y eliminación de campos sensibles en la respuesta mediante `class-transformer` (`instanceToPlain`).

---

## 📂 Estructura del Módulo

```text
src/modules/auth/
├── dto/
│   ├── change-password.dto.ts
│   ├── forgot-password.dto.ts
│   ├── login.dto.ts
│   └── reset-password.dto.ts
├── auth.controller.spec.ts
├── auth.controller.ts
├── auth.module.ts
├── auth.service.spec.ts
├── auth.service.ts
├── jwt.strategy.ts
└── README.md
```

---

## 📋 DTOs y Validaciones

| DTO                     | Propiedades                      | Descripción                                | Validaciones / Tipos           |
| :---------------------- | :------------------------------- | :----------------------------------------- | :----------------------------- |
| **`LoginDto`**          | `email`, `password`              | Credenciales de acceso.                    | `@IsEmail()`, `@IsString()`    |
| **`ForgotPasswordDto`** | `email`                          | Correo para solicitud de restablecimiento. | `@IsEmail()`                   |
| **`ResetPasswordDto`**  | `token`, `newPassword`           | Confirmación de nueva contraseña.          | `@IsUUID()`, `@MinLength(6)`   |
| **`ChangePasswordDto`** | `currentPassword`, `newPassword` | Cambio de contraseña desde sesión activa.  | `@IsString()`, `@MinLength(6)` |

---

## ⚙️ Flujos y Servicios (`AuthService`)

### 1. Login (`login`)

1. Consulta la existencia del cliente mediante `CustomersService.findByEmail(email)`.
2. Verifica la presencia de credenciales y que la cuenta tenga estado `ACTIVE`.
3. Compara la contraseña ingresada con el hash almacenado mediante `bcrypt.compare`.
4. Construye el payload JWT (`sub`, `email`, `role`).
5. Devuelve el token firmado (`access_token`), el objeto del cliente sanitizado con `instanceToPlain` y el resumen del usuario.

### 2. Olvido de Contraseña (`forgotPassword`)

1. Busca la cuenta asociada al correo ingresado.
2. Si existe, genera un token único con `randomUUID()` y fija una expiración de 15 minutos.
3. Guarda el token invocando `CustomersService.setResetPasswordToken`.
4. Retorna siempre la respuesta genérica: _"Si el correo está registrado, recibirás las instrucciones"_.

### 3. Restablecimiento (`resetPassword`)

1. Delega la validación del token de recuperación y actualización del hash a `CustomersService.resetPasswordWithToken`.

---

## 🛡️ Estrategia y Guardias (`JwtStrategy`)

La clase `JwtStrategy` extiende de `PassportStrategy(Strategy)` para:

- Extraer el token Bearer del encabezado `Authorization`.
- Verificar la validez de la firma usando la clave secreta configurada.
- Inyectar la información del usuario autenticado (`req.user`) en las rutas protegidas.

---

## 🧪 Pruebas Unitarias

El módulo cuenta con cobertura de pruebas unitarias para controladores y servicios (`auth.service.spec.ts` y `auth.controller.spec.ts`), incluyendo la validación de excepciones HTTP (`UnauthorizedException`, `BadRequestException`).

Para ejecutar el suite de pruebas del módulo:

```bash
npm run test -- auth
```
