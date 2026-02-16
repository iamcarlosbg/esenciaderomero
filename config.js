/* ============================================
   ESENCIA DE ROMERO - CONFIGURACIÓN
   Archivo de configuración para redes sociales
   ============================================ */

/**
 * CONFIGURACIÓN DE REDES SOCIALES
 * 
 * Este archivo controla qué redes sociales se muestran en el footer
 * de la página web.
 * 
 * CÓMO USAR:
 * 
 * 1. Para ACTIVAR una red social:
 *    - Cambia "enabled" a true
 *    - Añade la URL completa de tu perfil en "url"
 * 
 * 2. Para DESACTIVAR una red social:
 *    - Cambia "enabled" a false
 *    - La red NO se mostrará en el footer
 * 
 * EJEMPLO:
 * 
 * Si quieres mostrar solo Instagram y YouTube:
 * 
 * instagram: {
 *   enabled: true,
 *   url: "https://instagram.com/esenciaderomero"
 * },
 * facebook: {
 *   enabled: false,  // <- No se mostrará
 *   url: ""
 * },
 * youtube: {
 *   enabled: true,
 *   url: "https://youtube.com/@esenciaderomero"
 * },
 * tiktok: {
 *   enabled: false,  // <- No se mostrará
 *   url: ""
 * }
 * 
 * ⚠️ IMPORTANTE:
 * - Las URLs deben ser completas (incluir https://)
 * - No olvides guardar el archivo después de hacer cambios
 * - Los cambios se verán reflejados al recargar la página
 */

const CONFIG = {
    social: {
        // Instagram
        instagram: {
            enabled: true,  // Cambiar a true para mostrar
            url: "https://instagram.com/esenciaderomero"  // Tu usuario de Instagram
        },
        
        // Facebook
        facebook: {
            enabled: false,  // Cambiar a true para mostrar
            url: ""  // Tu página de Facebook
        },
        
        // YouTube
        youtube: {
            enabled: true,  // Cambiar a true para mostrar
            url: "https://youtube.com/@esenciaderomero"  // Tu canal de YouTube
        },
        
        // TikTok
        tiktok: {
            enabled: false,  // Cambiar a true para mostrar
            url: ""  // Tu usuario de TikTok
        }
    },
    
    // AQUÍ PUEDES AGREGAR MÁS CONFIGURACIONES EN EL FUTURO
    // Por ejemplo:
    
    // Información de contacto
    contact: {
        email: "eva@esenciaderomero.com",
        phone: "",  // Opcional
        location: "España"
    },
    
    // Configuración de la tienda (para futuras implementaciones)
    shop: {
        enabled: false,  // Si habilitas una tienda online en el futuro
        currency: "EUR",
        shipping: true
    }
};

// ============================================
// NO MODIFICAR EL CÓDIGO DE ABAJO
// (A menos que sepas lo que estás haciendo)
// ============================================

// Verificar que la configuración es válida
if (typeof CONFIG === 'undefined') {
    console.error('❌ Error: No se pudo cargar la configuración');
} else {
    console.log('✅ Configuración cargada correctamente');
    
    // Contar redes sociales activas
    const activeNetworks = Object.keys(CONFIG.social).filter(
        network => CONFIG.social[network].enabled
    );
    
    console.log(`📱 Redes sociales activas: ${activeNetworks.length}`);
    activeNetworks.forEach(network => {
        console.log(`   - ${network}: ${CONFIG.social[network].url}`);
    });
}
