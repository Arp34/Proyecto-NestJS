# Restaurant Management API

Backend en NestJS (ESModules) desarrollado con TypeORM, PostgreSQL y Jest. Esta API provee la infraestructura para la gestión integral de un restaurante (administración de mesas, comandas, menú y órdenes).

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado localmente:
- **Node.js** (v18 o superior)
- **npm** (v9 o superior)
- **Docker** y **Docker Desktop / Docker Compose**
- **Git**

---

## Guía de Inicio Rápido (Setup Local)

Sigue estos pasos en orden para levantar la aplicación y la base de datos en tu entorno de desarrollo:

### 1. Sincronizar la rama `dev`
```bash
git checkout dev
git pull origin dev
```

### 2. Crear tu rama de trabajo
```bash
git checkout -b feature/nombre-de-tu-tarea
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Configurar variables de entorno
Copia el archivo de plantilla `.env.example` para generar tu archivo local `.env`:
```bash
cp .env.example .env
```
*(Las credenciales predeterminadas en `.env.example` están configuradas para funcionar directamente con la base de datos en Docker).*

### 5. Iniciar la base de datos PostgreSQL (Docker)
Levanta el contenedor de PostgreSQL `restaurant_db` en segundo plano:
```bash
docker compose up -d
```
*Para verificar que el contenedor está corriendo:*
```bash
docker ps
```

### 6. Iniciar la aplicación en modo desarrollo
```bash
npm run start:dev
```
La aplicación se compilará y estará escuchando por defecto en: `http://localhost:3000`

---

## 🛠️ Guía de Creación de Módulos (CLI NestJS)

Para mantener la arquitectura del proyecto limpia y organizada, **todos los módulos deben ubicarse dentro de la carpeta `src/modules/`**.

Al ejecutar el comando de generación de NestJS CLI, asegúrate de incluir el prefijo `modules/` antes del nombre del recurso:

```bash
npx nest generate resource modules/<nombre_del_modulo>

## Documentación Interactiva de la API (Swagger)

Con la aplicación en ejecución (`npm run start:dev`), puedes acceder a la consola interactiva de Swagger para probar los endpoints y consultar los DTOs:

**`http://localhost:3000/api/docs`**

---

## Pruebas Unitarias e Integración (Jest)

Para ejecutar la suite de pruebas del proyecto:

```bash
# Ejecutar pruebas unitarias
npm run test

# Ejecutar pruebas en modo watch (desarrollo)
npm run test:watch

# Ver la cobertura de código
npm run test:cov
```

---

## Comandos Útiles

| Comando | Descripción |
| :--- | :--- |
| `npm run start:dev` | Inicia el servidor con recarga en caliente (*watch mode*). |
| `npm run build` | Compila el proyecto en la carpeta `dist/`. |
| `npm run lint` | Analiza el código en busca de errores de estilo o calidad. |
| `docker compose up -d` | Levanta PostgreSQL en Docker. |
| `docker compose down` | Detiene y remueve los contenedores de Docker. |

---

## Reglas y Flujo de Trabajo en Git

1. **Ramas Principales:**
   - `main`: Código en producción 100% estable.
   - `dev`: Rama de integración de todas las funcionalidades.
2. **Creación de PRs:** Toda nueva funcionalidad debe enviarse mediante un **Pull Request hacia la rama `dev`**.
3. **Aprobaciones:** Todo PR requiere la revisión y aprobación de **al menos 1 compañero de equipo** antes de ser fusionado.
4. **Seguridad:** NUNCA subas el archivo `.env` ni credenciales al repositorio.

---

## Estructura del Proyecto

```text
.
├── .github/                  # Plantillas de Pull Requests y guías de contribución
├── src/
│   ├── modules/
│   │   └── tables/           # Módulo de Mesas (HU-002)
│   │       └── entities/
│   │           └── table.entity.ts
│   ├── app.module.ts         # Módulo principal y conexión TypeORM
│   └── main.ts               # Punto de entrada de NestJS y Swagger
├── docker-compose.yml        # Servicio PostgreSQL
├── .env.example              # Plantilla de variables de entorno
└── jest.config.json          # Configuración de pruebas con ESM
```