/* ============================================================
   netlify/functions/create-checkout-session.js

   Función serverless que crea una sesión de Stripe Checkout.

   VARIABLES DE ENTORNO (Netlify → Site settings → Env vars):
     STRIPE_SECRET_KEY  →  sk_test_xxx  (o sk_live_xxx en producción)
     SUCCESS_URL        →  https://tudominio.netlify.app/gracias.html
     CANCEL_URL         →  https://tudominio.netlify.app/productos.html

   DEPENDENCIA (añadir a package.json en la raíz):
     { "dependencies": { "stripe": "^14.0.0" } }
   ============================================================ */

const Stripe = require('stripe');

exports.handler = async (event) => {

    /* Solo aceptar POST */
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Método no permitido' }),
        };
    }

    /* Verificar clave secreta */
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
        console.error('STRIPE_SECRET_KEY no está configurada en las variables de entorno.');
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Configuración del servidor incompleta.' }),
        };
    }

    /* Parsear body */
    let lineItems;
    try {
        const body = JSON.parse(event.body || '{}');
        lineItems  = body.lineItems;
        if (!Array.isArray(lineItems) || lineItems.length === 0) {
            throw new Error('lineItems inválido o vacío');
        }
    } catch (err) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Cuerpo de la solicitud inválido.' }),
        };
    }

    const stripe = Stripe(secretKey);

    /* Construir line_items para Stripe */
    const stripeLineItems = lineItems.map(item => ({
        price_data: {
            currency:     'eur',
            unit_amount:  item.precio,         // ya viene en céntimos desde el frontend
            product_data: {
                name:   item.nombre,
                images: item.imagen ? [item.imagen] : [],
                metadata: { productId: item.productId },
            },
        },
        quantity: item.cantidad,
    }));

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items:           stripeLineItems,
            mode:                 'payment',
            success_url: process.env.SUCCESS_URL
                || 'https://TU_DOMINIO.netlify.app/gracias.html?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: process.env.CANCEL_URL
                || 'https://TU_DOMINIO.netlify.app/productos.html',
            /* Recogida de dirección de envío */
            shipping_address_collection: {
                allowed_countries: ['ES', 'PT', 'FR', 'DE', 'IT'],
            },
            /* Campos del cliente */
            customer_creation: 'always',
            phone_number_collection: { enabled: false },
            /* Metadatos del pedido */
            metadata: {
                source: 'esencia-de-romero-web',
            },
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ sessionId: session.id }),
        };

    } catch (err) {
        console.error('Stripe error:', err.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message }),
        };
    }
};
