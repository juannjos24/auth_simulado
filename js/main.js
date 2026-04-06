/* ========================================
   SISTEMA DE CONTROL DE ACCESO - CALCULADORA
   
   Este archivo contiene toda la lógica para:
   1. Autenticación de usuarios
   2. Generación de tokens simulados
   3. Control de permisos por operación
   4. Operaciones de la calculadora
======================================== */

// ========================================
// BASE DE DATOS SIMULADA DE USUARIOS
// En un sistema real, esto estaría en un servidor
// ========================================

const USUARIOS = {
    // Usuario que solo puede sumar
    sumador: {
        password: '1234',
        permisos: ['suma'],          // Array con las operaciones permitidas
        nombre: 'Usuario Sumador'
    },
    // Usuario que solo puede restar
    restador: {
        password: '1234',
        permisos: ['resta'],
        nombre: 'Usuario Restador'
    },
    // Usuario que solo puede multiplicar
    multiplicador: {
        password: '1234',
        permisos: ['multiplicacion'],
        nombre: 'Usuario Multiplicador'
    },
    // Usuario que solo puede dividir
    divisor: {
        password: '1234',
        permisos: ['division'],
        nombre: 'Usuario Divisor'
    },
    // Administrador con acceso completo
    admin: {
        password: 'admin123',
        permisos: ['suma', 'resta', 'multiplicacion', 'division'],
        nombre: 'Administrador'
    }
};

// ========================================
// ESTADO DE LA SESIÓN
// Guarda la información del usuario actual
// ========================================

let sesionActual = {
    usuario: null,      // Nombre de usuario
    token: null,        // Token de autenticación
    permisos: []        // Permisos del usuario
};

// ========================================
// REFERENCIAS A ELEMENTOS DEL DOM
// Guardamos referencias para no buscarlas cada vez
// ========================================

const elementos = {
    // Secciones principales
    loginSection: document.getElementById('login-section'),
    calculatorSection: document.getElementById('calculator-section'),
    
    // Formulario de login
    loginForm: document.getElementById('login-form'),
    usernameInput: document.getElementById('username'),
    passwordInput: document.getElementById('password'),
    errorMessage: document.getElementById('error-message'),
    
    // Información del usuario
    userInfo: document.getElementById('user-info'),
    tokenDisplay: document.getElementById('token-display'),
    permissionsInfo: document.getElementById('permissions-info'),
    logoutBtn: document.getElementById('logout-btn'),
    
    // Calculadora
    num1: document.getElementById('num1'),
    num2: document.getElementById('num2'),
    result: document.getElementById('result'),
    resultText: document.getElementById('result-text'),
    noPermission: document.getElementById('no-permission'),
    
    // Botones de operaciones
    btnSuma: document.getElementById('btn-suma'),
    btnResta: document.getElementById('btn-resta'),
    btnMultiplicacion: document.getElementById('btn-multiplicacion'),
    btnDivision: document.getElementById('btn-division')
};

// ========================================
// FUNCIÓN: Generar Token Simulado
// Crea un token aleatorio que simula un JWT
// ========================================

function generarToken(usuario) {
    /*
     * En un sistema real, el token sería generado por el servidor
     * usando algoritmos como JWT (JSON Web Token).
     * 
     * Aquí creamos un token simulado con:
     * - Prefijo identificador
     * - Nombre de usuario codificado en base64
     * - Timestamp actual
     * - Caracteres aleatorios
     */
    
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const usuarioBase64 = btoa(usuario); // btoa() convierte a base64
    
    return `TOKEN_${usuarioBase64}_${timestamp}_${random}`;
}

// ========================================
// FUNCIÓN: Validar Credenciales
// Verifica si el usuario y contraseña son correctos
// ========================================

function validarCredenciales(usuario, password) {
    /*
     * Busca el usuario en nuestra "base de datos"
     * y verifica que la contraseña coincida.
     * 
     * Retorna: el objeto usuario si es válido, null si no lo es
     */
    
    const usuarioData = USUARIOS[usuario.toLowerCase()];
    
    if (usuarioData && usuarioData.password === password) {
        return usuarioData;
    }
    
    return null;
}

// ========================================
// FUNCIÓN: Iniciar Sesión
// Procesa el login y configura la sesión
// ========================================

function iniciarSesion(usuario, datosUsuario) {
    /*
     * Configura el estado de la sesión con:
     * - El nombre de usuario
     * - Un nuevo token generado
     * - Los permisos del usuario
     */
    
    sesionActual.usuario = usuario;
    sesionActual.token = generarToken(usuario);
    sesionActual.permisos = datosUsuario.permisos;
    
    // Mostrar la sección de calculadora
    mostrarCalculadora(datosUsuario);
    
    console.log('✅ Sesión iniciada:', sesionActual);
}

// ========================================
// FUNCIÓN: Cerrar Sesión
// Limpia la sesión y vuelve al login
// ========================================

function cerrarSesion() {
    /*
     * Reinicia el estado de la sesión
     * y muestra la pantalla de login
     */
    
    sesionActual = {
        usuario: null,
        token: null,
        permisos: []
    };
    
    // Ocultar calculadora, mostrar login
    elementos.calculatorSection.classList.add('hidden');
    elementos.loginSection.classList.remove('hidden');
    
    // Limpiar formulario
    elementos.loginForm.reset();
    elementos.errorMessage.classList.add('hidden');
    
    console.log('👋 Sesión cerrada');
}

// ========================================
// FUNCIÓN: Mostrar Calculadora
// Configura y muestra la interfaz de calculadora
// ========================================

function mostrarCalculadora(datosUsuario) {
    /*
     * Oculta el login y muestra la calculadora
     * configurada según los permisos del usuario
     */
    
    // Cambiar secciones visibles
    elementos.loginSection.classList.add('hidden');
    elementos.calculatorSection.classList.remove('hidden');
    
    // Mostrar información del usuario
    elementos.userInfo.textContent = `👤 ${datosUsuario.nombre}`;
    elementos.tokenDisplay.textContent = `🔑 ${sesionActual.token}`;
    
    // Mostrar permisos
    const permisosTexto = sesionActual.permisos.join(', ');
    elementos.permissionsInfo.textContent = `Operaciones permitidas: ${permisosTexto}`;
    
    // Configurar botones según permisos
    configurarBotones();
    
    // Limpiar resultados anteriores
    elementos.result.classList.add('hidden');
    elementos.noPermission.classList.add('hidden');
}

// ========================================
// FUNCIÓN: Configurar Botones
// Habilita/deshabilita botones según permisos
// ========================================

function configurarBotones() {
    /*
     * Recorre cada botón de operación y lo habilita
     * solo si el usuario tiene ese permiso
     */
    
    const botones = {
        'btn-suma': 'suma',
        'btn-resta': 'resta',
        'btn-multiplicacion': 'multiplicacion',
        'btn-division': 'division'
    };
    
    // Para cada botón, verificar si tiene permiso
    for (const [btnId, operacion] of Object.entries(botones)) {
        const boton = document.getElementById(btnId);
        const tienePermiso = sesionActual.permisos.includes(operacion);
        
        // disabled = true si NO tiene permiso
        boton.disabled = !tienePermiso;
    }
}

// ========================================
// FUNCIÓN: Verificar Permiso
// Comprueba si el usuario puede hacer una operación
// ========================================

function tienePermiso(operacion) {
    /*
     * Verifica si la operación está en la lista
     * de permisos del usuario actual
     */
    
    return sesionActual.permisos.includes(operacion);
}

// ========================================
// FUNCIÓN: Realizar Operación
// Ejecuta la operación matemática solicitada
// ========================================

function realizarOperacion(operacion) {
    /*
     * 1. Verifica que tenga permiso
     * 2. Obtiene los números
     * 3. Realiza el cálculo
     * 4. Muestra el resultado
     */
    
    // Ocultar mensajes anteriores
    elementos.result.classList.add('hidden');
    elementos.noPermission.classList.add('hidden');
    
    // Verificar permiso
    if (!tienePermiso(operacion)) {
        elementos.noPermission.classList.remove('hidden');
        console.log(`⛔ Sin permiso para: ${operacion}`);
        return;
    }
    
    // Obtener los números de los inputs
    const num1 = parseFloat(elementos.num1.value) || 0;
    const num2 = parseFloat(elementos.num2.value) || 0;
    
    let resultado;
    let simbolo;
    
    // Realizar la operación correspondiente
    switch (operacion) {
        case 'suma':
            resultado = num1 + num2;
            simbolo = '+';
            break;
        case 'resta':
            resultado = num1 - num2;
            simbolo = '-';
            break;
        case 'multiplicacion':
            resultado = num1 * num2;
            simbolo = '×';
            break;
        case 'division':
            if (num2 === 0) {
                elementos.resultText.textContent = '❌ Error: División por cero';
                elementos.result.classList.remove('hidden');
                return;
            }
            resultado = num1 / num2;
            simbolo = '÷';
            break;
        default:
            console.error('Operación no reconocida:', operacion);
            return;
    }
    
    // Mostrar resultado
    elementos.resultText.textContent = `${num1} ${simbolo} ${num2} = ${resultado}`;
    elementos.result.classList.remove('hidden');
    
    console.log(`✅ Operación: ${num1} ${simbolo} ${num2} = ${resultado}`);
}

// ========================================
// EVENT LISTENERS
// Configuración de eventos de la interfaz
// ========================================

// Evento: Envío del formulario de login
elementos.loginForm.addEventListener('submit', function(evento) {
    /*
     * Captura el envío del formulario,
     * valida las credenciales y procesa el login
     */
    
    // Prevenir que se recargue la página
    evento.preventDefault();
    
    // Obtener valores del formulario
    const usuario = elementos.usernameInput.value.trim();
    const password = elementos.passwordInput.value;
    
    // Ocultar error anterior
    elementos.errorMessage.classList.add('hidden');
    
    // Validar que se ingresaron datos
    if (!usuario || !password) {
        elementos.errorMessage.textContent = 'Por favor ingresa usuario y contraseña';
        elementos.errorMessage.classList.remove('hidden');
        return;
    }
    
    // Validar credenciales
    const datosUsuario = validarCredenciales(usuario, password);
    
    if (datosUsuario) {
        // Credenciales correctas - iniciar sesión
        iniciarSesion(usuario.toLowerCase(), datosUsuario);
    } else {
        // Credenciales incorrectas - mostrar error
        elementos.errorMessage.textContent = '❌ Usuario o contraseña incorrectos';
        elementos.errorMessage.classList.remove('hidden');
        console.log('❌ Intento de login fallido para:', usuario);
    }
});

// Evento: Click en botón de cerrar sesión
elementos.logoutBtn.addEventListener('click', cerrarSesion);

// Eventos: Clicks en botones de operaciones
elementos.btnSuma.addEventListener('click', () => realizarOperacion('suma'));
elementos.btnResta.addEventListener('click', () => realizarOperacion('resta'));
elementos.btnMultiplicacion.addEventListener('click', () => realizarOperacion('multiplicacion'));
elementos.btnDivision.addEventListener('click', () => realizarOperacion('division'));

// ========================================
// INICIALIZACIÓN
// Código que se ejecuta al cargar la página
// ========================================

console.log('🚀 Sistema de Control de Acceso iniciado');
console.log('📋 Usuarios disponibles:', Object.keys(USUARIOS));
