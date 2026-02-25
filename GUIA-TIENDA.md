# 🌿 Esencia de Romero — Guía de la Tienda Online

## 📁 Estructura de archivos

```
esencia-de-romero/
│
├── index.html                          ← Web principal (actualizada con enlace a tienda)
├── productos.html                      ← ✅ NUEVO: Página de la tienda
├── gracias.html                        ← ✅ NUEVO: Página de confirmación tras el pago
│
├── styles.css                          ← Estilos base (actualizado con nuevos botones)
├── tienda.css                          ← ✅ NUEVO: Estilos de la tienda
│
├── main.js                             ← JS de la web principal (sin cambios)
├── tienda.js                           ← ✅ NUEVO: Toda la lógica de la tienda
├── config.js                           ← Actualizado con configuración de Stripe
│
├── products.json                       ← ✅ NUEVO: Catálogo de productos
│
├── images/
│   └── products/                       ← 📂 Aquí van las fotos reales de Eva
│       └── (subir JPGs aquí)
│
├── netlify/
│   └── functions/
│       └── create-checkout-session.js  ← ✅ NUEVO: Función serverless de Stripe
│
├── netlify.toml                        ← ✅ NUEVO: Configuración de Netlify
└── package.json                        ← ✅ NUEVO: Dependencia de Stripe
```

---

## 🚀 IMPLEMENTACIÓN PASO A PASO

### PASO 1 — Copiar todos los archivos al repositorio

Añade al repositorio de GitHub todos los archivos marcados como `✅ NUEVO` y los actualizados:
- `productos.html`, `gracias.html`
- `tienda.css`, `tienda.js`
- `config.js` (reemplaza el existente)
- `styles.css` (reemplaza el existente)
- `products.json`
- `netlify/functions/create-checkout-session.js`
- `netlify.toml`
- `package.json`

---

### PASO 2 — Migrar de GitHub Pages a Netlify

GitHub Pages no soporta funciones serverless (que Stripe necesita). Netlify es **gratuito** y lee el mismo repositorio de GitHub.

1. Ve a [netlify.com](https://netlify.com) y crea una cuenta gratuita
2. Haz clic en **"Add new site" → "Import an existing project"**
3. Conecta tu repositorio de GitHub
4. Configuración de build:
   - **Build command**: *(déjalo vacío, es un sitio estático)*
   - **Publish directory**: `.`
5. Haz clic en **Deploy site**

Tu sitio tendrá una URL como `esencia-de-romero.netlify.app`. Puedes añadir tu dominio propio en **Domain settings**.

---

### PASO 3 — Configurar Stripe

#### A) Crear cuenta Stripe
1. Ve a [stripe.com](https://stripe.com) y crea una cuenta gratuita
2. Completa la verificación para activar cobros reales

#### B) Obtener las claves API
1. En el Dashboard de Stripe → **Developers → API keys**
2. Tendrás dos claves:
   - **Publishable key** (`pk_test_...`) → Va en `config.js`
   - **Secret key** (`sk_test_...`) → Va en variables de entorno de Netlify (**NUNCA en el código**)

#### C) Añadir clave secreta a Netlify
1. Netlify Dashboard → Tu sitio → **Site configuration → Environment variables**
2. Añade estas variables:
   ```
   STRIPE_SECRET_KEY  =  sk_test_XXXXXXXXXXXXXXXXX
   SUCCESS_URL        =  https://tu-sitio.netlify.app/gracias.html
   CANCEL_URL         =  https://tu-sitio.netlify.app/productos.html
   ```

#### D) Actualizar config.js con la clave pública
```javascript
stripe: {
    publicKey: "pk_test_AQUI_TU_CLAVE_PUBLICA",  // ← reemplaza esto
    sessionUrl: "/.netlify/functions/create-checkout-session"
},
successUrl: "https://tu-sitio.netlify.app/gracias.html",
cancelUrl:  "https://tu-sitio.netlify.app/productos.html"
```

---

### PASO 4 — Probar en modo test

Stripe ya viene en modo test por defecto. Usa estas tarjetas:

| Tarjeta | Resultado |
|---------|-----------|
| `4242 4242 4242 4242` | ✅ Pago exitoso |
| `4000 0025 0000 3155` | 🔐 Requiere autenticación 3DS |
| `4000 0000 0000 9995` | ❌ Pago rechazado |

- Fecha: cualquier futura (ej. `12/28`)
- CVC: cualquier 3 dígitos (ej. `123`)

---

### PASO 5 — Pasar a producción

1. En el Dashboard de Stripe → activa el **modo live** (switch arriba a la derecha)
2. Copia las claves **live** (`pk_live_...` y `sk_live_...`)
3. Actualiza en `config.js` la `publicKey` con `pk_live_...`
4. Actualiza en Netlify la variable `STRIPE_SECRET_KEY` con `sk_live_...`
5. Haz commit y push → Netlify redeploya automáticamente

---

## 🛍️ GESTIÓN DEL CATÁLOGO (muy fácil)

### Añadir un producto nuevo

Solo hay que hacer **dos cosas**:

**1. Sube la foto** a `images/products/nombre-del-jabón.jpg`
   - Tamaño recomendado: 800×600 px
   - Formato: JPG (más ligero) o WebP
   - Fondo claro para mejor resultado

**2. Añade una entrada en `products.json`:**

```json
{
  "id": "jabon-oliva-oregano-010",
  "nombre": "Oliva & Orégano",
  "categoria": "jabones-aceite",
  "precio": 9.50,
  "aroma": "Mediterráneo",
  "imagen": "images/products/jabon-oliva-oregano.jpg",
  "descripcion_corta": "Jabón con aceite de oliva virgen extra y orégano silvestre. Purificante y revitalizante.",
  "ingredientes": ["aceite de oliva virgen extra", "orégano", "sal marina", "sosa cáustica"],
  "stock": true,
  "destacado": false
}
```

**¡Listo! Los filtros se actualizan solos.** No hay que tocar ningún archivo JS.

---

### Campos del JSON

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único, sin espacios ni tildes |
| `nombre` | string | Nombre del producto (visible al cliente) |
| `categoria` | string | `jabones-aceite` / `jabones-glicerina` / `champus-solidos` |
| `precio` | number | Precio en euros (ej: `9.50`) |
| `aroma` | string | Aroma principal |
| `imagen` | string | Ruta relativa a la imagen |
| `descripcion_corta` | string | Texto breve (~100-130 caracteres) |
| `ingredientes` | array | Lista de ingredientes principales |
| `stock` | boolean | `true` = disponible, `false` = agotado |
| `destacado` | boolean | `true` = muestra badge "Destacado" |

### Otras acciones comunes

**Cambiar precio:** edita el campo `"precio"` en `products.json`

**Marcar como agotado:** cambia `"stock": false` (no desaparece, se muestra como "Agotado")

**Ocultar completamente:** elimina la entrada del JSON o añade `"visible": false` (requires minor JS tweak)

**Añadir nueva categoría:** escribe el nombre en `"categoria"` y el filtro se creará automáticamente

---

## 💰 COSTES

| Servicio | Coste mensual |
|----------|--------------|
| GitHub (repositorio) | Gratis |
| Netlify (hosting + functions) | Gratis (hasta 125k invocaciones/mes) |
| Stripe | 0 €/mes + **1,5% + 0,25 €** por transacción europea |

**Ejemplo:** En 50 ventas de 9 € → coste Stripe ≈ 8,50 €

---

## 🔮 MEJORAS FUTURAS

### Fáciles (sin backend)
- **Página de producto individual** con URL propia (para compartir en Instagram)
- **Fotos múltiples** por producto con galería
- **Formulario de contacto** con Netlify Forms (gratuito, sin código)
- **Cupones de descuento** (Stripe los soporta de forma nativa)
- **Wishlist** guardada en localStorage

### Media dificultad
- **Decap CMS** (antes Netlify CMS): panel visual para que Eva gestione productos sin tocar JSON
- **Opciones de envío** configuradas en Stripe Checkout
- **Variantes de producto** (talla de barra, fragancia, etc.)
- **Email de confirmación personalizado** vía Stripe Webhooks

---

## 🆘 SOLUCIÓN DE PROBLEMAS

**Los productos no aparecen**
→ Abre la consola del navegador (F12). Si ves error en `products.json`, comprueba que el archivo está bien formateado. Puedes validar JSON en [jsonlint.com](https://jsonlint.com)

**El botón "Finalizar compra" no hace nada**
→ Asegúrate de haber configurado la `stripePublicKey` en `config.js` y que la función de Netlify está desplegada. Revisa la consola para ver el error exacto.

**Stripe devuelve error 500**
→ Comprueba que `STRIPE_SECRET_KEY` está correctamente configurada en las variables de entorno de Netlify.

**Los filtros no muestran mi nueva categoría**
→ El valor de `"categoria"` en el JSON debe usar exactamente estos valores: `jabones-aceite`, `jabones-glicerina`, `champus-solidos`. O puedes añadir el label de tu nueva categoría en la función `labelCategoria()` dentro de `tienda.js`.

---

## 📞 SOPORTE

Si necesitas ayuda con algún paso, los mejores recursos son:
- Documentación Netlify Functions: [docs.netlify.com/functions](https://docs.netlify.com/functions/overview/)
- Documentación Stripe Checkout: [stripe.com/docs/checkout](https://stripe.com/docs/checkout/quickstart)
