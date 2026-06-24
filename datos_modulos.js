// ==========================================================================
// CONTENEDOR DE DATOS Y COMANDOS MAESTROS - MAXIQUEEN OS v2.1
// Modifica solo este archivo para añadir páginas o nuevos comandos de voz/texto.
// ==========================================================================

// 1. BASE DE DATOS DE TUS MÓDULOS (Mantén o añade tus links aquí)
window.baseDeDatosPaginas = [
    {
        categoria: "Vídeo del Sistema e Interfaces Base",
        archivos: [
            { name: "index.html", desc: "Interfaz de entrada principal unificada." },
            { name: "LoginMQ.html", desc: "Módulo de autenticación y acceso seguro." },
            { name: "system.html", desc: "Configuraciones globales del core operativo." },
            { name: "dashboard.html", desc: "Área de trabajo ejecutiva principal." },
            { name: "dashboard2.html", desc: "Variante alternativa del panel maestro." },
            { name: "apps.html", desc: "Librería y catálogo interno de aplicaciones." },
            { name: "ActivarsistemaMQ.html", desc: "Consola de activación de licencias." },
            { name: "ActivasistemaMQ2.html", desc: "Módulo complementario de activación." },
            { name: "Activosindex.html", desc: "Indexador de recursos activos." },
            { name: "index4000.html", desc: "Variante experimental del core de acceso." }
        ]
    },
    {
        categoria: "Ecosistema de Chats e Inteligencia Artificial",
        archivos: [
            { name: "ChatOS.html", desc: "Chat principal con funciones avanzadas de voz." },
            { name: "ChatOS2.html", desc: "Segunda iteración de la interfaz del chat." },
            { name: "ChatAdvance.html", desc: "Consola de chat optimizada para flujos complejos." },
            { name: "ChatBuilderMQ.html", desc: "Constructor visual de flujos conversacionales." },
            { name: "ChatNeutral.html", desc: "Línea base limpia para interacciones conversacionales." },
            { name: "CHATBASICO2026.html", desc: "Modelo de mensería básico estructurado." },
            { name: "Chat2026.html", desc: "Refactorización moderna del script de chat." },
            { name: "SOLOCHAT.html", desc: "Entorno aislado para pruebas conversacionales rápidas." },
            { name: "solo_chat_editable.html", desc: "Plantilla de chat interactivo modificable." },
            { name: "whatsappOS.html", desc: "Simulador e integrador para mensajería tipo WhatsApp." },
            { name: "Build_IA_Chat_Bas.html", desc: "Módulo de inicialización de prompts básicos de IA." },
            { name: "Builder_chat_MQ.html", desc: "Editor alternativo de layouts para chats." }
        ]
    },
    {
        categoria: "CRM, Automatización y Ventas",
        archivos: [
            { name: "CRM_PAG_FEB.html", desc: "Tablero analítico principal del CRM comercial." },
            { name: "Clientes.html", desc: "Base de datos y perfiles de consumidores." },
            { name: "Ventas.html", desc: "Seguimiento de conversiones y embudos." },
            { name: "VentasDominio.html", desc: "Mapeo de ventas vinculadas a nombres de dominio." },
            { name: "ventas2026.html", desc: "Módulo comercial con vinculación a Google Analytics." },
            { name: "ventasv11.html", desc: "Última iteración del módulo transaccional." },
            { name: "AgenteVentas.html", desc: "Panel exclusivo para la gestión de ejecutivos comerciales." },
            { name: "Subagentes.html", desc: "Estructura jerárquica para redes de distribución." },
            { name: "crm_demo.html", desc: "Entorno de pruebas y demostración comercial." },
            { name: "pruebcrm.html", desc: "Laboratorio de flujos para automatizaciones de leads." },
            { name: "playCarrito.html", desc: "Motor interactivo del carro de compras." }
        ]
    },
    {
        categoria: "Gestión de Productos y Catálogos",
        archivos: [
            { name: "AdmProCatalogo.html", desc: "Administrador nativo para inventarios de catálogo." },
            { name: "AdmProdAvanzado.html", desc: "Panel avanzado con control total de propiedades." },
            { name: "AdmProdCatalogo2.html", desc: "Variante optimizada del gestor de productos." },
            { name: "Store_MaxiQueen.html", desc: "Interfaz final de la tienda de ropa y calzado." },
            { name: "Catalogosencillo_naranja.html", desc: "Catálogo simplificado de alta conversión visual." },
            { name: "prodind.html", desc: "Fichas de producto individuales optimizadas." }
        ]
    },
    {
        categoria: "MaxiQueen Arcade (Módulo de Juegos)",
        archivos: [
            { name: "Sudoku MaxiQueen PRO 👑.html", desc: "Edición premium y estilizada de Sudoku corporativo." },
            { name: "Sudokuadvance.html", desc: "Variante avanzada con algoritmos de dificultad." },
            { name: "Sudokutawtto.html", desc: "Integración específica del tablero de Sudoku." },
            { name: "sudoku-play1.0.html", desc: "Línea base del motor del juego." },
            { name: "sudoku-play2.0.html", desc: "Actualización de mecánicas del Sudoku." },
            { name: "playsnake.html", desc: "Juego clásico Snake con UI mejorada y lógica pulida." },
            { name: "JuegosIntegradosMQ.html", desc: "Hub centralizado de entretenimiento interno." },
            { name: "JuegotorresMQ.html", desc: "Juego QueenTower con soporte responsivo móvil." },
            { name: "PlayTorres2.html", desc: "Evolución de layouts responsivos con Flexbox." },
            { name: "PlayTorres3.html", desc: "Fase 3 de desarrollo de dinámicas de torres." },
            { name: "PlayTorres4.html", desc: "Fase 4 de desarrollo de físicas." },
            { name: "PlayTorres5.html", desc: "Fase 5 de optimización de renderizado." },
            { name: "PlayTorres6.html", desc: "Edición final fluida y adaptativa." },
            { name: "playTorresMQ.html", desc: "Instancia transaccional del juego de torres." },
            { name: "QueenTower.html", desc: "Script maestro del juego insignia de la torre." },
            { name: "ShadowRunner.html", desc: "Módulo arcade de desplazamiento lateral rápido." },
            { name: "adivina.html", desc: "Juego interactivo de agilidad mental y predicciones." },
            { name: "juego12.html", desc: "Prototipo lúdico número 12." },
            { name: "CuadroMQ.html", desc: "Estructuras y estilos para mecánicas de juegos RPG." },
            { name: "playclick2.html", desc: "Módulo incremental de clicks rápidos." },
            { name: "clickMQ.html", desc: "Mecánica base del clicker corporativo." }
        ]
    },
    {
        categoria: "Servicios Cloud, Motores y Diagnósticos",
        archivos: [
            { name: "main.py", desc: "Motor backend principal, manejo de API Keys y endpoints." },
            { name: "cesarapi.py", desc: "Lógica API complementaria de procesamiento." },
            { name: "Cloudos.html", desc: "Módulo de gestión e infraestructura en la nube." },
            { name: "Clouds1.html", desc: "Consola de almacenamiento y lectura de archivos." },
            { name: "cloudAzulFebr.html", desc: "Interfaz temática para despliegues en servidores externos." },
            { name: "inspector MQ.html", desc: "Herramienta de auditoría de rendimiento del sistema." },
            { name: "inspectorv2.html", desc: "Segunda fase de la suite de diagnóstico interno." },
            { name: "inspectorv3.html", desc: "Versión de producción del inspector de flujos." },
            { name: "test-compressor.html", desc: "Compresor de video integrado para optimización de ancho de banda." },
            { name: "SeleccionarArcSubirDocumento.html", desc: "Gestor nativo de carga de archivos multimedia." },
            { name: "mapa_visual_api.html", desc: "Mapeador visual de endpoints y respuestas del servidor." }
        ]
    },
    {
        categoria: "Perfiles y Galerías Visuales",
        archivos: [
            { name: "Perfil12026.html", desc: "Configurador avanzado de perfiles de usuario." },
            { name: "Perfil2026.html", desc: "Estructura de cuenta comercial actualizada." },
            { name: "Perfilv3.html", desc: "Ficha técnica y visual de usuarios del sistema." },
            { name: "Avatar_Pro.html", desc: "Módulo de personalización de identidades de marca." },
            { name: "Barraperfiles.html", desc: "Componente UI flotante de navegación de identidades." },
            { name: "galeria.html", desc: "Visualizador multimedia con barras laterales dinámicas." },
            { name: "galeria2.html", desc: "Layout alternativo para activos gráficos." },
            { name: "galeriav2.html", desc: "Módulo optimizado de renderizado de imágenes de alta fidelidad." },
            { name: "galeriav3.html", desc: "Galería de control de flujos visuales." },
            { name: "galeriav4.html", desc: "Variante con soporte de carga asíncrona." },
            { name: "galeriav5.html", desc: "Versión depurada y pulida para producción." },
            { name: "galeriav6.html", desc: "Último diseño del visor multimedia." },
            { name: "galeryoutube.html", desc: "Indexador de contenidos y tutoriales en formato video." }
        ]
    },
    {
        categoria: "Políticas, Información y Soporte Técnico",
        archivos: [
            { name: "about.html", desc: "Información institucional y visión del proyecto." },
            { name: "contact.html", desc: "Canales directos de soporte y atención comercial." },
            { name: "privacidad.html", desc: "Estructura legal de protección de bases de datos de clientes." },
            { name: "terminos.html", desc: "Términos y condiciones de la plataforma SaaS humana." },
            { name: "cookies.html", desc: "Políticas vigentes de rastreo analítico y GTM." },
            { name: "premium.html", desc: "Detalle y pasarela de ventajas del plan empresarial." },
            { name: "PlataformaSaaSHumana.html", desc: "Manifiesto y flujo de la estructura tecnológica humana." },
            { name: "Inf_Sena.html", desc: "Reportes académicos y organizacionales vinculados." },
            { name: "Apache_License.html", desc: "Documentación de la licencia de distribución abierta." },
            { name: "license.html", desc: "Mapeo legal complementario de uso de software." }
        ]
    }
];

// 2. COMANDOS PERSONALIZADOS - Ahora con funciones ejecutables
window.comandosInteligentes = [
    {
        claves: ["hola", "buenos días", "buenas tardes", "saludos"],
        respuesta: "¡Hola, César! El núcleo operativo de MaxiQueen OS está listo. ¿Qué módulo deseas desplegar o buscar hoy?",
        accion: () => MQCore.hablar("Hola César, todos los sistemas listos.")
    },
    {
        claves: ["estado del sistema", "estatus", "cómo va todo"],
        respuesta: "Todos los sistemas base están operando de forma óptima. Veo tus deploys correctos en el ecosistema y la sincronización lista.",
        accion: () => MQCore.estadoSistema()
    },
    {
        claves: ["limpiar", "borrar chat", "reiniciar"],
        respuesta: "Entendido, reiniciando la consola conversacional...",
        accion: () => MQCore.limpiarConsola()
    },
    {
        claves: ["ayuda", "qué puedes hacer", "comandos"],
        respuesta: "Puedo buscar y abrir cualquier archivo por ti si mencionas su nombre, leer la página completa, buscar texto dentro del DOM, o responder a comandos. Di 'leer página' o 'busca X'.",
        accion: () => MQCore.mostrarAyuda()
    },
    // NUEVOS COMANDOS CEREBRO
    {
        claves: ["leer página", "lee todo", "léeme esto"],
        respuesta: "Iniciando lectura completa de la página actual...",
        accion: () => MQCore.leerPaginaCompleta()
    },
    {
        claves: ["para de hablar", "silencio", "cállate"],
        respuesta: "De acuerdo, cancelando lectura de voz.",
        accion: () => MQCore.detenerVoz()
    },
    {
        claves: ["busca", "buscar", "encuentra"],
        respuesta: "Dime qué texto quieres que busque en esta página.",
        accion: (texto) => MQCore.buscarEnDOM(texto)
    },
    {
        claves: ["abrir", "abre", "lanza", "ejecuta"],
        respuesta: "Buscando módulo para abrir...",
        accion: (texto) => MQCore.abrirModulo(texto)
    },
    {
        claves: ["resumen", "resume la página"],
        respuesta: "Analizando contenido para crear resumen...",
        accion: () => MQCore.resumirPagina()
    },
    {
        claves: ["cuántos módulos", "total archivos"],
        respuesta: "Calculando total de módulos registrados...",
        accion: () => MQCore.contarModulos()
    }
];

// ==========================================================================
// 3. NÚCLEO CEREBRO MQCore - NUEVAS FUNCIONES INTELIGENTES
// ==========================================================================
window.MQCore = {
    voz: window.speechSynthesis,
    lectorActual: null,
    ultimaBusqueda: [],

    // Lee texto con voz
    hablar: function(texto) {
        this.detenerVoz();
        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'es-CO';
        utterance.rate = 1.1;
        utterance.pitch = 1;
        this.lectorActual = utterance;
        this.voz.speak(utterance);
        return texto;
    },

    detenerVoz: function() {
        if (this.voz.speaking) this.voz.cancel();
    },

    // Lee toda la página sin salir de ella
    leerPaginaCompleta: function() {
        const elementos = document.querySelectorAll('h1, h2, h3, p, li, td, span, button, a');
        let textoCompleto = '';
        elementos.forEach(el => {
            const txt = el.innerText.trim();
            if (txt && txt.length > 3) textoCompleto += txt + '. ';
        });
        if (textoCompleto.length > 5000) {
            this.hablar("La página es muy extensa. Te leo los primeros 5000 caracteres. " + textoCompleto.substring(0, 5000));
        } else {
            this.hablar(textoCompleto || "No encontré texto legible en esta página.");
        }
        return textoCompleto;
    },

    // Busca texto dentro del DOM actual y resalta resultados
    buscarEnDOM: function(query) {
        if (!query) return "¿Qué quieres que busque?";
        this.limpiarResaltado();
        const regex = new RegExp(query, 'gi');
        let encontrados = 0;

        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const nodosTexto = [];
        while (walker.nextNode()) nodosTexto.push(walker.currentNode);

        nodosTexto.forEach(node => {
            if (regex.test(node.nodeValue)) {
                const span = document.createElement('mark');
                span.style.background = '#FFD700';
                span.style.color = '#000';
                span.className = 'mq-highlight';
                node.parentNode.replaceChild(span, node);
                span.appendChild(node);
                encontrados++;
            }
        });

        const respuesta = `Encontré ${encontrados} coincidencias de "${query}" en la página.`;
        this.hablar(respuesta);
        return respuesta;
    },

    limpiarResaltado: function() {
        document.querySelectorAll('.mq-highlight').forEach(mark => {
            mark.outerHTML = mark.innerHTML;
        });
    },

    // Abre módulo buscando por nombre aproximado
    abrirModulo: function(nombre) {
        if (!nombre) return "Dime el nombre del módulo.";
        const nombreLimpio = nombre.toLowerCase().replace(/abrir|abre|lanza|ejecuta/g, '').trim();
        let encontrado = null;

        for (const cat of window.baseDeDatosPaginas) {
            for (const archivo of cat.archivos) {
                if (archivo.name.toLowerCase().includes(nombreLimpio) ||
                    archivo.desc.toLowerCase().includes(nombreLimpio)) {
                    encontrado = archivo;
                    break;
                }
            }
            if (encontrado) break;
        }

        if (encontrado) {
            this.hablar(`Abriendo ${encontrado.name}. ${encontrado.desc}`);
            window.open(encontrado.name, '_blank');
            return `Abriendo: ${encontrado.name}`;
        } else {
            this.hablar(`No encontré ningún módulo llamado ${nombreLimpio}`);
            return `Módulo no encontrado: ${nombreLimpio}`;
        }
    },

    // Resume la página con IA básica
    resumirPagina: function() {
        const titulos = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText).slice(0, 5);
        const parrafos = Array.from(document.querySelectorAll('p')).map(p => p.innerText).slice(0, 3);
        let resumen = "Resumen de la página: ";
        if (titulos.length) resumen += "Secciones: " + titulos.join(', ') + ". ";
        if (parrafos.length) resumen += "Contenido: " + parrafos.join(' ').substring(0, 300) + "...";
        this.hablar(resumen);
        return resumen;
    },

    // Estado del sistema + módulos
    estadoSistema: function() {
        const total = this.contarModulos(true);
        const estado = `Sistemas operativos. Tienes ${total} módulos registrados en ${window.baseDeDatosPaginas.length} categorías. Memoria del DOM: ${document.querySelectorAll('*').length} elementos.`;
        this.hablar(estado);
        return estado;
    },

    contarModulos: function(silencioso = false) {
        let total = 0;
        window.baseDeDatosPaginas.forEach(cat => total += cat.archivos.length);
        if (!silencioso) this.hablar(`Total de módulos: ${total}`);
        return total;
    },

    limpiarConsola: function() {
        console.clear();
        this.detenerVoz();
        this.limpiarResaltado();
        this.hablar("Consola reiniciada");
    },

    mostrarAyuda: function() {
        const comandos = window.comandosInteligentes.map(c => c.claves[0]).join(', ');
        this.hablar(`Comandos disponibles: ${comandos}. También puedo abrir archivos diciendo su nombre.`);
    }
};

// ==========================================================================
// 4. INTERPRETADOR DE COMANDOS - Ejecuta acciones automáticamente
// ==========================================================================
window.MQInterpretar = function(inputUsuario) {
    const texto = inputUsuario.toLowerCase().trim();

    // 1. Buscar en comandos inteligentes
    for (const cmd of window.comandosInteligentes) {
        for (const clave of cmd.claves) {
            if (texto.includes(clave)) {
                // Si el comando tiene acción, ejecutarla
                if (cmd.accion) {
                    // Extraer parámetro si existe: "busca clientes" -> "clientes"
                    const parametro = texto.replace(clave, '').trim();
                    const resultado = cmd.accion(parametro);
                    return resultado || cmd.respuesta;
                }
                return cmd.respuesta;
            }
        }
    }

    // 2. Si no hay comando, intentar abrir módulo por nombre
    return MQCore.abrirModulo(texto);
};

// Activar escucha de voz opcional
window.MQEscuchar = function() {
    if (!('webkitSpeechRecognition' in window)) {
        return "Tu navegador no soporta reconocimiento de voz.";
    }
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'es-CO';
    recognition.continuous = false;
    recognition.onresult = (event) => {
        const comando = event.results[0][0].transcript;
        console.log('Comando detectado:', comando);
        const respuesta = window.MQInterpretar(comando);
        MQCore.hablar(respuesta);
    };
    recognition.start();
    return "Escuchando... di un comando.";
};