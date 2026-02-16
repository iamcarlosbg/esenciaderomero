# 🌿 Esencia de Romero - Sitio Web

Bienvenida a tu página web de jabones artesanales.

## 📁 Archivos incluidos

- **index.html** - Página principal con toda la estructura
- **styles.css** - Estilos y diseño visual
- **main.js** - Funcionalidades interactivas
- **config.js** - Configuración de redes sociales
- **README.md** - Este archivo de instrucciones

## 🚀 Cómo usar

1. **Extrae todos los archivos** en la misma carpeta
2. **Abre index.html** con tu navegador
3. ¡Listo! La web ya funciona

## 🎨 Productos incluidos

La web muestra tres categorías de productos:

### 1. Jabones de Aceites (3 productos)
- Romero & Lavanda
- Avena & Miel  
- Carbón Activado

### 2. Jabones de Glicerina (3 productos)
- Rosa Cristalina
- Miel Dorada
- Lavanda Relajante

### 3. Champús Sólidos (3 productos)
- Nutritivo Coco & Karité
- Equilibrante Árbol de Té
- Brillo Natural Cítricos

## 🖼️ Cambiar las imágenes

Las imágenes actuales son placeholders de Unsplash. Para poner tus propias fotos:

1. Guarda tus fotos en la misma carpeta que los archivos HTML
2. Abre **index.html** con un editor de texto (Notepad++, VSCode, etc.)
3. Busca las líneas con `<img src="https://images.unsplash.com/..."`
4. Reemplaza la URL por el nombre de tu imagen, ejemplo:
   ```html
   <!-- ANTES -->
   <img src="https://images.unsplash.com/photo-1600428853084..." alt="Jabón">
   
   <!-- DESPUÉS -->
   <img src="mi-jabon-romero.jpg" alt="Jabón">
   ```

**Consejo:** Nombra tus fotos de forma clara: `jabon-romero.jpg`, `champu-coco.jpg`, etc.

## 📱 Configurar redes sociales

Para activar/desactivar redes sociales, edita el archivo **config.js**:

```javascript
instagram: {
    enabled: true,  // ← Cambiar a true para mostrar
    url: "https://instagram.com/tu_usuario"  // ← Tu URL
},
facebook: {
    enabled: false,  // ← false = no se muestra
    url: ""
}
```

### Redes disponibles:
- Instagram
- Facebook
- YouTube
- TikTok

## ✏️ Personalizar textos

Abre **index.html** con un editor de texto y busca:

- **Hero**: Título y subtítulo principal (líneas ~40-50)
- **Sobre mí**: Tu historia personal (líneas ~80-130)
- **Productos**: Nombres y descripciones (líneas ~150-400)
- **Contacto**: Email y ubicación (líneas ~450-480)

## 🎨 Cambiar colores

Si quieres cambiar los colores, abre **styles.css** y modifica estas líneas al inicio:

```css
:root {
    --color-verde-romero: #6B8E6F;    /* Color principal */
    --color-beige: #E8DCC4;            /* Color secundario */
    --color-blanco-roto: #FAFAF8;      /* Fondo */
}
```

## 🌐 Subir a Internet

Para publicar tu web necesitas:

1. **Hosting gratuito**: Netlify, Vercel, GitHub Pages
2. **Dominio** (opcional): puedes usar el gratuito que te dan

### Opción fácil - Netlify:
1. Ve a [netlify.com](https://netlify.com)
2. Arrastra la carpeta con todos los archivos
3. ¡Listo! Te dan una URL gratis

## 📞 Soporte

Si tienes dudas sobre cómo personalizar la web:
- Revisa este README
- Busca tutoriales de "editar HTML básico"
- Los cambios principales están comentados en el código

## 💡 Consejos

- **Guarda copias** antes de hacer cambios
- **Prueba en el navegador** después de cada cambio
- **Usa nombres simples** para tus archivos de imágenes
- **Mantén todos los archivos juntos** en la misma carpeta

---

✨ **¡Disfruta tu nueva web!** ✨

Hecho con 💚 para Esencia de Romero
