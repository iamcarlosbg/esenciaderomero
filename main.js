/* ============================================
   ESENCIA DE ROMERO - MAIN JAVASCRIPT
   Funcionalidades interactivas
   ============================================ */

// ============================================
// NAVBAR: Aparece al hacer scroll
// ============================================

const navbar = document.getElementById('navbar');
let lastScrollPosition = 0;

window.addEventListener('scroll', () => {
    const currentScrollPosition = window.pageYOffset;
    
    // Mostrar navbar después de 100px de scroll
    if (currentScrollPosition > 100) {
        navbar.classList.add('visible');
    } else {
        navbar.classList.remove('visible');
    }
    
    lastScrollPosition = currentScrollPosition;
});

// ============================================
// SMOOTH SCROLL para los enlaces de navegación
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        
        // Si es el enlace al inicio (#inicio), volver arriba
        if (targetId === '#inicio') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Offset para el navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ============================================
// REVEAL ANIMATIONS: Elementos aparecen al hacer scroll
// ============================================

const revealElements = document.querySelectorAll('.reveal');

const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const revealPoint = 100;
    
    revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        
        if (elementTop < windowHeight - revealPoint) {
            element.classList.add('active');
        }
    });
};

// Ejecutar al cargar y al hacer scroll
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// ============================================
// PARALLAX EFFECT en Hero
// ============================================

const hero = document.querySelector('.hero');

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxSpeed = 0.5;
    
    if (hero) {
        hero.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
    }
});

// ============================================
// LAZY LOADING para imágenes
// ============================================

const images = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
        }
    });
}, {
    rootMargin: '50px'
});

images.forEach(img => imageObserver.observe(img));

// ============================================
// REDES SOCIALES DINÁMICAS
// ============================================

/**
 * Genera los enlaces de redes sociales dinámicamente
 * basándose en la configuración de config.js
 */
function loadSocialLinks() {
    const socialContainer = document.getElementById('socialLinks');
    
    // Verificar que existe el contenedor y la configuración
    if (!socialContainer || typeof CONFIG === 'undefined') {
        console.error('No se pudo cargar la configuración de redes sociales');
        return;
    }
    
    // Definir los iconos de Font Awesome para cada red social
    const socialIcons = {
        instagram: 'fab fa-instagram',
        facebook: 'fab fa-facebook-f',
        youtube: 'fab fa-youtube',
        tiktok: 'fab fa-tiktok'
    };
    
    // Nombres legibles para cada red
    const socialNames = {
        instagram: 'Instagram',
        facebook: 'Facebook',
        youtube: 'YouTube',
        tiktok: 'TikTok'
    };
    
    // Limpiar el contenedor
    socialContainer.innerHTML = '';
    
    // Recorrer las redes sociales en la configuración
    Object.keys(CONFIG.social).forEach(socialNetwork => {
        const config = CONFIG.social[socialNetwork];
        
        // Solo mostrar si está habilitada y tiene URL
        if (config.enabled && config.url) {
            // Crear el enlace
            const link = document.createElement('a');
            link.href = config.url;
            link.className = 'social-link';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.setAttribute('aria-label', socialNames[socialNetwork] || socialNetwork);
            
            // Crear el icono
            const icon = document.createElement('i');
            icon.className = socialIcons[socialNetwork] || 'fas fa-link';
            
            // Agregar el icono al enlace
            link.appendChild(icon);
            
            // Agregar animación de entrada
            link.style.opacity = '0';
            link.style.transform = 'translateY(20px)';
            
            // Agregar al contenedor
            socialContainer.appendChild(link);
            
            // Animar la aparición
            setTimeout(() => {
                link.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                link.style.opacity = '1';
                link.style.transform = 'translateY(0)';
            }, 100);
        }
    });
    
    // Si no hay redes habilitadas, mostrar un mensaje opcional
    if (socialContainer.children.length === 0) {
        const message = document.createElement('p');
        message.textContent = 'Síguenos en redes sociales';
        message.style.color = 'var(--color-beige)';
        message.style.fontSize = '0.9rem';
        socialContainer.appendChild(message);
    }
}

// ============================================
// ANIMACIÓN DE CONTADORES (opcional)
// ============================================

/**
 * Anima números desde 0 hasta el valor final
 * Útil para estadísticas si se quieren agregar más adelante
 */
function animateCounter(element, start, end, duration) {
    let current = start;
    const range = end - start;
    const increment = range / (duration / 16); // 60 FPS
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            element.textContent = Math.round(end);
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current);
        }
    }, 16);
}

// ============================================
// DETECTAR MODO OSCURO DEL SISTEMA (para futuras mejoras)
// ============================================

const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

function handleThemeChange(e) {
    // Esta función está preparada para implementar modo oscuro en el futuro
    if (e.matches) {
        // El usuario prefiere modo oscuro
        console.log('Modo oscuro detectado');
    } else {
        // El usuario prefiere modo claro
        console.log('Modo claro detectado');
    }
}

prefersDarkScheme.addEventListener('change', handleThemeChange);

// ============================================
// PERFORMANCE: Reducir animaciones si el usuario lo prefiere
// ============================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
    // Desactivar animaciones pesadas para usuarios que prefieren menos movimiento
    document.documentElement.style.setProperty('--transition-smooth', 'none');
    document.documentElement.style.setProperty('--transition-slow', 'none');
}

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Función principal que se ejecuta al cargar el DOM
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌿 Esencia de Romero - Web cargada correctamente');
    
    // Cargar redes sociales dinámicamente
    loadSocialLinks();
    
    // Ejecutar reveal inicial
    revealOnScroll();
    
    // Agregar clase loaded al body para animaciones CSS
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// ============================================
// UTILIDADES ADICIONALES
// ============================================

/**
 * Función para validar email (útil si se agrega un formulario)
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Función para mostrar notificaciones (útil para formularios)
 */
function showNotification(message, type = 'info') {
    // Esta función está preparada para mostrar notificaciones toast
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Aquí se podría implementar un sistema de notificaciones visual
    // Por ahora solo lo registramos en consola
}

/**
 * Debounce function para optimizar eventos que se disparan frecuentemente
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimizar el evento scroll con debounce
const optimizedScroll = debounce(() => {
    revealOnScroll();
}, 50);

window.addEventListener('scroll', optimizedScroll);

// ============================================
// EASTER EGG: Mensaje en consola
// ============================================

console.log(
    '%c🌿 Esencia de Romero 🌿',
    'color: #6B8E6F; font-size: 20px; font-weight: bold; font-family: Cormorant Garamond, serif;'
);
console.log(
    '%cJabones artesanales hechos con amor 💚',
    'color: #5A6B5D; font-size: 14px;'
);
console.log(
    '%c¿Te gusta el código? Contáctame en eva@esenciaderomero.com',
    'color: #E8DCC4; font-size: 12px;'
);

// ============================================
// FIN DEL SCRIPT
// ============================================
