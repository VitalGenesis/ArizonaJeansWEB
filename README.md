# Arizona Jeans — Tienda Online de Ropa

Tienda de indumentaria online con MercadoPago, Firebase y Nodemailer. Deployable en Vercel.

**Ubicación:** San José de la Dormida, Córdoba, Argentina.

---

## Estructura de archivos

```
arizona-jeans/
├── api/
│   └── server.js          ← Backend Express + MercadoPago + Nodemailer
├── public/
│   ├── index.html         ← Tienda principal
│   ├── admin/
│   │   └── index.html     ← Panel de administración
│   ├── exito.html
│   ├── error.html
│   └── pendiente.html
├── package.json
├── vercel.json
└── README.md
```

---

## Variables de entorno (Vercel)

En el panel de Vercel → Settings → Environment Variables, agregá:

```
MP_ACCESS_TOKEN       = tu_access_token_de_mercadopago
BASE_URL              = https://arizona-jeans.vercel.app
GMAIL_USER            = tu-email@gmail.com
GMAIL_APP_PASSWORD    = tu_app_password_de_google
ADMIN_EMAIL           = tu-email@gmail.com
```

---

## Configuración de Firebase

1. Creá un proyecto en [Firebase Console](https://console.firebase.google.com/) con el ID `arizona-jeans`.
2. Habilitá **Firestore Database** en modo producción.
3. Habilitá **Authentication** → Email/Password.
4. Creá una colección `productos` con la estructura:

```json
{
  "nombre": "Mom Jean Classic",
  "precio": 35,
  "descripcion": "Talle M · Azul oscuro · 98% algodón",
  "categoria": "Jeans",
  "talle": "M",
  "color": "Azul oscuro",
  "imagen": "https://...",
  "visible": true,
  "destacado": true,
  "stock": true,
  "createdAt": "timestamp"
}
```

5. Reemplazá en `public/index.html` y `public/admin/index.html` los valores de `firebaseConfig`:

```js
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "arizona-jeans.firebaseapp.com",
  projectId: "arizona-jeans",
  storageBucket: "arizona-jeans.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};
```

---

## Cómo actualizar el tipo de cambio

El tipo de cambio USD → ARS está definido en `api/server.js`:

```js
const TC = 1300; // Modificar acá
```

Y también en `public/index.html` (para mostrar precios al cliente):

```js
const TC = 1300;
```

Ambos valores deben mantenerse sincronizados.

---

## Cómo agregar tallas y colores a los productos

Desde el **Panel Admin** (`/admin`):

1. Ingresar con tu cuenta de Firebase Auth.
2. Ir a "Agregar producto".
3. Completar los campos **Talle** y **Color**.
4. El campo **Descripción** puede combinar ambos, por ejemplo: `Talle M · Negro · 98% algodón`.

Los filtros de la tienda funcionan por **Categoría** (Jeans, Remeras, Blazers, Accesorios, Ofertas).

---

## Deploy en Vercel

```bash
npm install -g vercel
vercel --prod
```

O conectá el repositorio de GitHub en [vercel.com](https://vercel.com) y el deploy es automático.

---

## WhatsApp

El número de WhatsApp está definido en `api/server.js`:

```js
const WA_NUMBER = "5493512345678";
```

Reemplazarlo con el número real del negocio (formato internacional, sin `+`).

---

## Tecnologías

- **Backend:** Node.js + Express
- **Pagos:** MercadoPago SDK v2
- **Base de datos:** Firebase Firestore
- **Autenticación:** Firebase Auth
- **Emails:** Nodemailer + Gmail
- **Deploy:** Vercel
- **Autocompletado de direcciones:** Nominatim (OpenStreetMap)
