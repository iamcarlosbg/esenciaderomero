/* ============================================================
   ESENCIA DE ROMERO — tienda.js
   Lógica completa de la tienda:
     · Carga de productos desde products.json
     · Filtros combinables (búsqueda, categoría, aroma,
       ingredientes, precio, stock)
     · Carrito persistente (localStorage)
     · Modal de detalle de producto
     · Checkout con Stripe
   ============================================================ */

/* ────────────────────────────────────────────────────────────
   CONFIGURACIÓN
   Las claves y URLs se leen de config.js (window.CONFIG).
   ────────────────────────────────────────────────────────────
   En config.js añade/actualiza:

   const CONFIG = {
     ...existente...,
     stripe: {
       publicKey: 'pk_test_XXXXXXXXXXXXXXXX',   // ← clave pública Stripe
       sessionUrl: '/.netlify/functions/create-checkout-session'
     },
     productsJson: 'products.json'
   };
   ──────────────────────────────────────────────────────────── */

const TIENDA_CFG = {
    stripeKey:    (window.CONFIG?.stripe?.publicKey)   || 'pk_test_PON_AQUI_TU_CLAVE_PUBLICA',
    sessionUrl:   (window.CONFIG?.stripe?.sessionUrl)  || '/.netlify/functions/create-checkout-session',
    productsJson: (window.CONFIG?.productsJson)        || 'products.json',
    cartKey:      'esencia_romero_cart_v1',
};

/* ────────────────────────────────────────────────────────────
   ESTADO
   ──────────────────────────────────────────────────────────── */
let productos   = [];          // Todos los productos cargados
let carrito     = [];          // [{ id, nombre, precio, imagen, cantidad }]
let filtros     = {
    busqueda:     '',
    categorias:   [],
    aromas:       [],
    ingredientes: [],
    precioMax:    Infinity,
    soloStock:    false,
    orden:        'default',
};

/* ────────────────────────────────────────────────────────────
   ARRANQUE
   ──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
    cargarCarritoStorage();
    actualizarBadge();
    renderCarrito();

    await cargarProductos();
    construirFiltros();
    renderProductos();

    bindEventos();
    cargarRedesSociales(); // reutiliza la lógica de main.js
});

/* ────────────────────────────────────────────────────────────
   CARGA DE PRODUCTOS
   ──────────────────────────────────────────────────────────── */
async function cargarProductos() {
    try {
        const res = await fetch(TIENDA_CFG.productsJson);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        productos = await res.json();
    } catch (err) {
        console.error('Error cargando products.json:', err);
        mostrarToast('No se pudieron cargar los productos. Recarga la página.', 'error');
        productos = [];
    }
}

/* ────────────────────────────────────────────────────────────
   CONSTRUCCIÓN DINÁMICA DE FILTROS
   ──────────────────────────────────────────────────────────── */
function construirFiltros() {
    /* Precio máximo */
    const maxPrecio = Math.max(...productos.map(p => p.precio), 15);
    const slider = document.getElementById('precioRange');
    slider.max   = maxPrecio;
    slider.value = maxPrecio;
    document.querySelector('.filtro-range-limites span:last-child').textContent = `${maxPrecio} €`;
    document.getElementById('precioLabel').textContent = `${maxPrecio} €`;
    filtros.precioMax = maxPrecio;

    /* Categorías */
    const categorias = [...new Set(productos.map(p => p.categoria))];
    renderGrupoChecks('categoriaFiltros', categorias, 'categoria', labelCategoria);

    /* Aromas */
    const aromas = [...new Set(productos.map(p => p.aroma).filter(Boolean))].sort();
    renderGrupoChecks('aromaFiltros', aromas, 'aroma');

    /* Ingredientes */
    const ingredientes = [...new Set(productos.flatMap(p => p.ingredientes || []))].sort();
    renderGrupoChecks('ingredienteFiltros', ingredientes, 'ingrediente');
}

function labelCategoria(cat) {
    const mapa = {
        'jabones-aceite':   'Jabones de aceite',
        'jabones-glicerina':'Jabones de glicerina',
        'champus-solidos':  'Champús sólidos',
    };
    return mapa[cat] || cat;
}

function renderGrupoChecks(contenedorId, valores, tipo, labelFn) {
    const el = document.getElementById(contenedorId);
    if (!el) return;
    el.innerHTML = valores.map(v => `
        <label class="filtro-check-item">
            <input type="checkbox" data-filtro-tipo="${tipo}" value="${v}" />
            <span>${labelFn ? labelFn(v) : v}</span>
        </label>
    `).join('');
}

/* ────────────────────────────────────────────────────────────
   FILTRADO Y ORDENACIÓN
   ──────────────────────────────────────────────────────────── */
function aplicarFiltros() {
    let lista = [...productos];
    const { busqueda, categorias, aromas, ingredientes, precioMax, soloStock, orden } = filtros;

    if (busqueda) {
        const q = busqueda.toLowerCase();
        lista = lista.filter(p =>
            p.nombre.toLowerCase().includes(q) ||
            (p.descripcion_corta || '').toLowerCase().includes(q) ||
            (p.ingredientes || []).some(i => i.toLowerCase().includes(q))
        );
    }
    if (categorias.length)   lista = lista.filter(p => categorias.includes(p.categoria));
    if (aromas.length)       lista = lista.filter(p => aromas.includes(p.aroma));
    if (ingredientes.length) lista = lista.filter(p =>
        ingredientes.every(ing => (p.ingredientes || []).includes(ing))
    );
    lista = lista.filter(p => p.precio <= precioMax);
    if (soloStock) lista = lista.filter(p => p.stock !== false);

    if (orden === 'precio-asc')  lista.sort((a,b) => a.precio - b.precio);
    if (orden === 'precio-desc') lista.sort((a,b) => b.precio - a.precio);
    if (orden === 'nombre')      lista.sort((a,b) => a.nombre.localeCompare(b.nombre, 'es'));

    return lista;
}

/* ────────────────────────────────────────────────────────────
   RENDER DE PRODUCTOS
   ──────────────────────────────────────────────────────────── */
function renderProductos() {
    const filtrados  = aplicarFiltros();
    const grid       = document.getElementById('productosGrid');
    const vacio      = document.getElementById('estadoVacio');
    const conteo     = document.getElementById('productosConteo');

    conteo.textContent = `${filtrados.length} producto${filtrados.length !== 1 ? 's' : ''}`;

    if (!filtrados.length) {
        grid.innerHTML = '';
        vacio.hidden   = false;
        return;
    }
    vacio.hidden = true;

    grid.innerHTML = filtrados.map(p => {
        const agotado = p.stock === false;
        return `
        <article class="producto-card${agotado ? ' agotado' : ''}"
                 data-id="${p.id}"
                 tabindex="0"
                 role="button"
                 aria-label="Ver detalle de ${p.nombre}">
            <div class="producto-card__imagen">
                <img src="${p.imagen}" alt="${p.nombre}" loading="lazy"
                     onerror="this.src='https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=500&q=70'" />
                ${p.destacado && !agotado
                    ? '<span class="producto-card__badge producto-card__badge--destacado">Destacado</span>'
                    : agotado
                        ? '<span class="producto-card__badge producto-card__badge--agotado">Agotado</span>'
                        : ''}
            </div>
            <div class="producto-card__cuerpo">
                <p class="producto-card__categoria">${labelCategoria(p.categoria)}</p>
                <h3 class="producto-card__nombre">${p.nombre}</h3>
                <p class="producto-card__aroma"><i class="fas fa-leaf"></i> ${p.aroma || 'Sin aroma'}</p>
                <p class="producto-card__desc">${p.descripcion_corta || ''}</p>
            </div>
            <div class="producto-card__pie">
                <span class="producto-card__precio">${formatPrecio(p.precio)}</span>
                <button class="btn-anadir"
                        data-product-id="${p.id}"
                        ${agotado ? 'disabled' : ''}
                        aria-label="Añadir ${p.nombre} al carrito">
                    ${agotado ? 'Agotado' : '<i class="fas fa-plus"></i> Añadir'}
                </button>
            </div>
        </article>
        `;
    }).join('');

    /* Eventos en tarjetas */
    grid.querySelectorAll('.producto-card').forEach(card => {
        card.addEventListener('click', e => {
            if (e.target.closest('.btn-anadir')) return;
            abrirModal(card.dataset.id);
        });
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter') abrirModal(card.dataset.id);
        });
    });

    grid.querySelectorAll('.btn-anadir').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            agregarAlCarrito(btn.dataset.productId);
        });
    });
}

/* ────────────────────────────────────────────────────────────
   MODAL DE DETALLE
   ──────────────────────────────────────────────────────────── */
function abrirModal(id) {
    const p = productos.find(x => x.id === id);
    if (!p) return;

    const agotado = p.stock === false;

    document.getElementById('modalContenido').innerHTML = `
        <div class="modal-imagen">
            <img src="${p.imagen}" alt="${p.nombre}"
                 onerror="this.src='https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80'" />
        </div>
        <div class="modal-info">
            <p class="modal-categoria">${labelCategoria(p.categoria)}</p>
            <h2 class="modal-nombre">${p.nombre}</h2>
            <p class="modal-precio">${formatPrecio(p.precio)}</p>
            <p class="modal-descripcion">${p.descripcion_corta || ''}</p>
            <div>
                <p class="modal-ingredientes-titulo"><i class="fas fa-leaf"></i> Ingredientes</p>
                <div class="modal-tags">
                    ${(p.ingredientes || []).map(i => `<span class="modal-tag">${i}</span>`).join('')}
                </div>
            </div>
            <div class="modal-acciones">
                <button class="btn-anadir" data-product-id="${p.id}" ${agotado ? 'disabled' : ''}>
                    ${agotado
                        ? '<i class="fas fa-times"></i> Producto agotado'
                        : '<i class="fas fa-shopping-bag"></i> Añadir al carrito'}
                </button>
            </div>
        </div>
    `;

    document.getElementById('modalContenido').querySelector('.btn-anadir')?.addEventListener('click', () => {
        agregarAlCarrito(p.id);
        cerrarModal();
        setTimeout(abrirCarrito, 200);
    });

    const modal = document.getElementById('productoModal');
    modal.hidden = false;
    setTimeout(() => {
        modal.classList.add('abierto');
        document.getElementById('overlayModal').classList.add('visible');
    }, 10);
    document.body.style.overflow = 'hidden';
}

function cerrarModal() {
    document.getElementById('productoModal').classList.remove('abierto');
    document.getElementById('overlayModal').classList.remove('visible');
    document.body.style.overflow = '';
    setTimeout(() => { document.getElementById('productoModal').hidden = true; }, 280);
}

/* ────────────────────────────────────────────────────────────
   CARRITO
   ──────────────────────────────────────────────────────────── */
function cargarCarritoStorage() {
    try {
        carrito = JSON.parse(localStorage.getItem(TIENDA_CFG.cartKey)) || [];
    } catch { carrito = []; }
}

function guardarCarritoStorage() {
    localStorage.setItem(TIENDA_CFG.cartKey, JSON.stringify(carrito));
}

function agregarAlCarrito(id) {
    const p = productos.find(x => x.id === id);
    if (!p || p.stock === false) return;

    const existente = carrito.find(i => i.id === id);
    if (existente) {
        existente.cantidad += 1;
    } else {
        carrito.push({ id: p.id, nombre: p.nombre, precio: p.precio, imagen: p.imagen, cantidad: 1 });
    }
    guardarCarritoStorage();
    renderCarrito();
    actualizarBadge();
    mostrarToast(`"${p.nombre}" añadido al carrito`);
}

function cambiarCantidad(id, delta) {
    const item = carrito.find(i => i.id === id);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) carrito = carrito.filter(i => i.id !== id);
    guardarCarritoStorage();
    renderCarrito();
    actualizarBadge();
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(i => i.id !== id);
    guardarCarritoStorage();
    renderCarrito();
    actualizarBadge();
}

function actualizarBadge() {
    const total  = carrito.reduce((s, i) => s + i.cantidad, 0);
    const badge  = document.getElementById('cartBadge');
    badge.textContent = total;
    badge.classList.toggle('visible', total > 0);
}

function renderCarrito() {
    const itemsEl   = document.getElementById('carritoItems');
    const vacioEl   = document.getElementById('carritoVacio');
    const footerEl  = document.getElementById('carritoFooter');

    if (!carrito.length) {
        itemsEl.innerHTML   = '';
        vacioEl.style.display  = 'flex';
        footerEl.hidden     = true;
        return;
    }
    vacioEl.style.display = 'none';
    footerEl.hidden = false;

    itemsEl.innerHTML = carrito.map(item => `
        <div class="carrito-item" data-id="${item.id}">
            <img class="carrito-item__img" src="${item.imagen}" alt="${item.nombre}"
                 onerror="this.src='https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=200&q=60'" />
            <div class="carrito-item__info">
                <span class="carrito-item__nombre">${item.nombre}</span>
                <span class="carrito-item__precio">${formatPrecio(item.precio)}</span>
                <div class="carrito-item__qty">
                    <button class="qty-btn" data-accion="menos" data-id="${item.id}" aria-label="Restar">−</button>
                    <span class="qty-num">${item.cantidad}</span>
                    <button class="qty-btn" data-accion="mas" data-id="${item.id}" aria-label="Sumar">+</button>
                </div>
            </div>
            <button class="carrito-item__eliminar" data-id="${item.id}" aria-label="Eliminar ${item.nombre}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');

    /* Subtotal */
    const subtotal = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
    document.getElementById('carritoSubtotal').textContent = formatPrecio(subtotal);

    /* Botones de cantidad y eliminar */
    itemsEl.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            cambiarCantidad(btn.dataset.id, btn.dataset.accion === 'mas' ? 1 : -1);
        });
    });
    itemsEl.querySelectorAll('.carrito-item__eliminar').forEach(btn => {
        btn.addEventListener('click', () => eliminarDelCarrito(btn.dataset.id));
    });
}

function abrirCarrito() {
    document.getElementById('carritoPanel').classList.add('abierto');
    document.getElementById('overlayCarrito').classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function cerrarCarrito() {
    document.getElementById('carritoPanel').classList.remove('abierto');
    document.getElementById('overlayCarrito').classList.remove('visible');
    document.body.style.overflow = '';
}

/* ────────────────────────────────────────────────────────────
   STRIPE CHECKOUT
   ──────────────────────────────────────────────────────────── */
async function iniciarCheckout() {
    if (!carrito.length) return;

    const btn = document.getElementById('btnCheckout');
    btn.disabled    = true;
    btn.innerHTML   = '<i class="fas fa-spinner fa-spin"></i> Redirigiendo…';

    try {
        const lineItems = carrito.map(item => ({
            productId: item.id,
            nombre:    item.nombre,
            precio:    Math.round(item.precio * 100),   // céntimos
            cantidad:  item.cantidad,
            imagen:    item.imagen,
        }));

        const res = await fetch(TIENDA_CFG.sessionUrl, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ lineItems }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Error del servidor (${res.status})`);
        }

        const { sessionId } = await res.json();

        /* Redirigir a Stripe Checkout */
        const stripe = Stripe(TIENDA_CFG.stripeKey);
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) throw new Error(error.message);

    } catch (err) {
        console.error('Checkout error:', err);
        mostrarToast('Error al procesar el pago. Inténtalo de nuevo.', 'error');
        btn.disabled  = false;
        btn.innerHTML = 'Finalizar compra <i class="fas fa-arrow-right"></i>';
    }
}

/* ────────────────────────────────────────────────────────────
   TOAST
   ──────────────────────────────────────────────────────────── */
let toastTimer;
function mostrarToast(msg, tipo = 'ok') {
    const el = document.getElementById('toast');
    el.innerHTML = tipo === 'ok'
        ? `<i class="fas fa-check-circle"></i> ${msg}`
        : `<i class="fas fa-exclamation-circle"></i> ${msg}`;
    el.style.background = tipo === 'ok' ? 'var(--color-verde-oscuro)' : '#c0392b';
    el.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('visible'), 3000);
}

/* ────────────────────────────────────────────────────────────
   UTILIDADES
   ──────────────────────────────────────────────────────────── */
function formatPrecio(n) {
    return n.toFixed(2).replace('.', ',') + ' €';
}

function limpiarTodosFiltros() {
    filtros = {
        busqueda:     '',
        categorias:   [],
        aromas:       [],
        ingredientes: [],
        precioMax:    parseFloat(document.getElementById('precioRange').max),
        soloStock:    false,
        orden:        'default',
    };
    document.getElementById('busquedaInput').value     = '';
    document.getElementById('ordenSelect').value       = 'default';
    document.getElementById('soloStock').checked       = false;
    document.querySelectorAll('[data-filtro-tipo]').forEach(cb => cb.checked = false);
    const s = document.getElementById('precioRange');
    s.value = s.max;
    document.getElementById('precioLabel').textContent = `${s.max} €`;
    renderProductos();
}

/* ────────────────────────────────────────────────────────────
   REDES SOCIALES (compatibilidad con config.js existente)
   ──────────────────────────────────────────────────────────── */
function cargarRedesSociales() {
    const container = document.getElementById('socialLinks');
    if (!container || typeof CONFIG === 'undefined' || !CONFIG.social) return;

    const iconos  = { instagram: 'fab fa-instagram', facebook: 'fab fa-facebook-f', youtube: 'fab fa-youtube', tiktok: 'fab fa-tiktok' };
    const nombres = { instagram: 'Instagram', facebook: 'Facebook', youtube: 'YouTube', tiktok: 'TikTok' };

    container.innerHTML = '';
    Object.keys(CONFIG.social).forEach((red, i) => {
        const cfg = CONFIG.social[red];
        if (!cfg.enabled || !cfg.url) return;
        const a = document.createElement('a');
        a.href = cfg.url;
        a.className = 'social-link';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.setAttribute('aria-label', nombres[red] || red);
        a.innerHTML = `<i class="${iconos[red] || 'fas fa-link'}"></i>`;
        container.appendChild(a);
        setTimeout(() => { a.style.opacity = '1'; a.style.transform = 'translateY(0)'; }, 100 * (i + 1));
    });
}

/* ────────────────────────────────────────────────────────────
   BIND DE TODOS LOS EVENTOS
   ──────────────────────────────────────────────────────────── */
function bindEventos() {

    /* Carrito */
    document.getElementById('cartToggleBtn').addEventListener('click', abrirCarrito);
    document.getElementById('carritoCerrar').addEventListener('click', cerrarCarrito);
    document.getElementById('overlayCarrito').addEventListener('click', cerrarCarrito);
    document.getElementById('btnCheckout').addEventListener('click', iniciarCheckout);

    /* Modal */
    document.getElementById('modalCerrar').addEventListener('click', cerrarModal);
    document.getElementById('overlayModal').addEventListener('click', cerrarModal);

    /* Búsqueda */
    document.getElementById('busquedaInput').addEventListener('input', e => {
        filtros.busqueda = e.target.value.trim();
        renderProductos();
    });

    /* Checkboxes dinámicos (categoría, aroma, ingrediente) */
    document.addEventListener('change', e => {
        const input = e.target;
        if (!input.dataset.filtroTipo) return;
        const tipo  = input.dataset.filtroTipo;
        const valor = input.value;
        const mapa  = { categoria: 'categorias', aroma: 'aromas', ingrediente: 'ingredientes' };
        const key   = mapa[tipo];
        if (!key) return;
        if (input.checked) {
            if (!filtros[key].includes(valor)) filtros[key].push(valor);
        } else {
            filtros[key] = filtros[key].filter(v => v !== valor);
        }
        renderProductos();
    });

    /* Precio */
    document.getElementById('precioRange').addEventListener('input', e => {
        const val = parseFloat(e.target.value);
        document.getElementById('precioLabel').textContent = `${val.toFixed(0)} €`;
        filtros.precioMax = val;
        renderProductos();
    });

    /* Solo stock */
    document.getElementById('soloStock').addEventListener('change', e => {
        filtros.soloStock = e.target.checked;
        renderProductos();
    });

    /* Orden */
    document.getElementById('ordenSelect').addEventListener('change', e => {
        filtros.orden = e.target.value;
        renderProductos();
    });

    /* Limpiar filtros */
    document.getElementById('limpiarFiltros').addEventListener('click', limpiarTodosFiltros);
    document.getElementById('resetVacio').addEventListener('click', limpiarTodosFiltros);

    /* Filtros mobile (drawer) */
    const panelFiltros = document.getElementById('filtrosPanel');
    const overlayFiltros = document.getElementById('overlayFiltros');

    document.getElementById('btnFiltrosMobile').addEventListener('click', () => {
        panelFiltros.classList.toggle('abierto');
        overlayFiltros.classList.toggle('visible');
        document.body.style.overflow = panelFiltros.classList.contains('abierto') ? 'hidden' : '';
    });
    overlayFiltros.addEventListener('click', () => {
        panelFiltros.classList.remove('abierto');
        overlayFiltros.classList.remove('visible');
        document.body.style.overflow = '';
    });

    /* Hamburguesa mobile navbar */
    const navHamburger = document.getElementById('navHamburger');
    const navMenu      = document.querySelector('.nav-menu');
    if (navHamburger && navMenu) {
        navHamburger.addEventListener('click', () => {
            const abierto = navMenu.style.display === 'flex';
            navMenu.style.display   = abierto ? '' : 'flex';
            navMenu.style.flexDirection = 'column';
            navMenu.style.position  = abierto ? '' : 'absolute';
            navMenu.style.top       = abierto ? '' : '100%';
            navMenu.style.left      = abierto ? '' : '0';
            navMenu.style.right     = abierto ? '' : '0';
            navMenu.style.background = abierto ? '' : 'rgba(250,250,248,0.98)';
            navMenu.style.padding   = abierto ? '' : '1rem 2rem';
            navMenu.style.boxShadow = abierto ? '' : 'var(--shadow-md)';
        });
    }

    /* ESC cierra overlays */
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { cerrarModal(); cerrarCarrito(); }
    });
}
