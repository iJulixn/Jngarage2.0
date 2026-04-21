# JN Garage Detail - App de Lavadero

App web simple hecha con React + Vite para administrar clientes, turnos, servicios y caja.

## Qué trae
- Login demo
- Panel principal
- Clientes
- Turnos
- Servicios
- Caja
- Turnos online
- Guardado local en el navegador (localStorage)

## Usuario demo
- Usuario: `julian`
- Clave: `1234`

## Cómo probarla en tu compu
1. Instalá Node.js
2. Abrí una terminal dentro de esta carpeta
3. Corré:

```bash
npm install
npm run dev
```

## Cómo generar la versión para subir
```bash
npm install
npm run build
```

Eso te crea la carpeta `dist`, que es la que se sube.

## Dónde conviene subirla
### Opción más fácil
- **Vercel** o **Netlify**

### Opción para cuando tenga backend
- **Render**

## Importante
Esta versión guarda datos en el navegador. Si querés una versión posta para usar todos los días, lo ideal es pasarla después a:
- Frontend: React
- Backend: Flask
- Base de datos: PostgreSQL
- Hosting: Render
