/* ========================================
   SISTEMA DE CONTROL DE ACCESO - CALCULADORA
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
        permisos: ['suma'],
        nombre: 'Calculadora Sumadora'
    },
    // Usuario que solo puede multiplicar
    multiplicador: {
        password: '1234',
        permisos: ['multiplicacion'],
        nombre: 'Calculadora Multiplicadora'
    }
};

// ========================================
// ESTADO DE LA SESIÓN
// Guarda la información del usuario actual
// ========================================

let sesionActual = {
    usuario: null,
    token: null,
    permisos: []
};

// Estado de la calculadora
let estadoCalculadora = {
    display: '0',
    operacion: null,
    valorAnterior: null
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
    
    // Calculadora display
    display: document.getElementById('display'),
    noPermission: document.getElementById('no-permission'),
    
    // Botones de operaciones
    btnSuma: document.getElementById('btn-suma'),
    btnMultiplicacion: document.getElementById('btn-multiplicacion'),
    btnIgual: document.getElementById('btn-igual'),
    btnLimpiar: document.getElementById('btn-limpiar'),
    
    // Botones numéricos
    botonesNum: document.querySelectorAll('.btn-num')
};

// ========================================
// FUNCIÓN: Generar Token Simulado
// Crea un token aleatorio que simula un JWT
// ========================================

function generarToken(usuario) {
    /*
     * Genera un token aleatorio
     */    
    const random = Math.random().toString(36).substring(2, 15);
    return `TOKEN_${random}`.toUpperCase();
}

// ========================================
// FUNCIÓN: Validar Credenciales
// Verifica si el usuario y contraseña son correctos
// ========================================

function validarCredenciales(usuario, password) {
    /*
     * Busca el usuario en nuestra "base de datos"
     * y verifica que la contraseña coincida.          
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
     * - Guarda el token en localStorage
     */
    
    sesionActual.usuario = usuario;
    sesionActual.token = generarToken(usuario);
    sesionActual.permisos = datosUsuario.permisos;
    
    // Guardar token en localStorage, estos son los valores que
    //se guardan en la data
    localStorage.setItem('authToken', sesionActual.token);
    localStorage.setItem('authUsuario', usuario);
    localStorage.setItem('authPermisos', JSON.stringify(datosUsuario.permisos));
    
    // Mostrar la sección de calculadora
    mostrarCalculadora(datosUsuario);
    
    console.log('Sesión iniciada:', sesionActual);
    console.log('Token guardado en localStorage:', sesionActual.token);
}

// ========================================
// FUNCIÓN: Cerrar Sesión
// Limpia la sesión y vuelve al login
// ========================================

function cerrarSesion() {
    /*
     * Reinicia el estado de la sesión,
     * limpia localStorage y vuelve al login
     */
    
    // Limpiar localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUsuario');
    localStorage.removeItem('authPermisos');
    
    //Reinicio de la sesion actual
    sesionActual = {
        usuario: null,
        token: null,
        permisos: []
    };
    
    // Resetear calculadora
    estadoCalculadora = {
        display: '0',
        operacion: null,
        valorAnterior: null
    };
    
    // Ocultar calculadora, mostrar login
    elementos.calculatorSection.classList.add('hidden');
    elementos.loginSection.classList.remove('hidden');
    
    // Limpiar formulario
    elementos.loginForm.reset();
    elementos.errorMessage.classList.add('hidden');
    
    console.log('Token removido de localStorage');
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
    elementos.userInfo.textContent = ` ${datosUsuario.nombre}`;
    elementos.tokenDisplay.textContent = ` ${sesionActual.token.substring(0, 30)}...`;
    
    // Mostrar operación permitida
    if (sesionActual.permisos.includes('suma')) {
        elementos.permissionsInfo.textContent = 'Operación: SUMA (+)';
    } else if (sesionActual.permisos.includes('multiplicacion')) {
        elementos.permissionsInfo.textContent = 'Operación: MULTIPLICACIÓN (×)';
    }
    
    // Configurar botones según permisos
    configurarBotones();
    
    // Inicializar display
    elementos.display.value = '0';
    estadoCalculadora = {
        display: '0',
        operacion: null,
        valorAnterior: null
    };
    
    // Limpiar mensajes de error
    elementos.noPermission.classList.add('hidden');
}

// ========================================
// FUNCIÓN: Configurar Botones
// Habilita/deshabilita botones según permisos
// ========================================

function configurarBotones() {
    /*
     * Habilita/deshabilita los botones de operaciones
     * según los permisos del usuario, multiplicar o sumar
     */
    
    const tieneSuma = sesionActual.permisos.includes('suma');
    const tieneMultiplicacion = sesionActual.permisos.includes('multiplicacion');
    
    elementos.btnSuma.disabled = !tieneSuma;
    elementos.btnMultiplicacion.disabled = !tieneMultiplicacion;
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
// FUNCIONES DE LA CALCULADORA
// Lógica para manipular números y operaciones
// ========================================

function agregarNumero(numero) {
    /*
     * Agrega un número al display
     * Si el display es '0', reemplaza, si no, concatena
     */
    if (estadoCalculadora.display === '0') {
        estadoCalculadora.display = numero.toString();
    } else {
        estadoCalculadora.display += numero.toString();
    }
    actualizarDisplay();
}

function establecerOperacion(operacion) {
    /*
     * Guarda la operación y el valor actual
     * Prepara para el siguiente número
     */
    
    // Verificar permiso
    if (!tienePermiso(operacion)) {
        elementos.noPermission.classList.remove('hidden');
        console.log(`Sin permiso para: ${operacion}`);
        return;
    }
    
    elementos.noPermission.classList.add('hidden');
    
    if (estadoCalculadora.valorAnterior === null) {
        estadoCalculadora.valorAnterior = parseFloat(estadoCalculadora.display);
    } else {
        // Si ya hay una operación pendiente, calcular primero
        const resultado = calcularResultado();
        estadoCalculadora.valorAnterior = resultado;
        estadoCalculadora.display = resultado.toString();
    }
    
    estadoCalculadora.operacion = operacion;
    estadoCalculadora.display = '0';
    actualizarDisplay();
    
    console.log(`Operación seleccionada: ${operacion}`);
}

function calcularResultado() {
    /*
     * Realiza el cálculo según la operación guardada
     */
    
    if (estadoCalculadora.operacion === null || estadoCalculadora.valorAnterior === null) {
        return parseFloat(estadoCalculadora.display);
    }
    
    const num1 = estadoCalculadora.valorAnterior;
    const num2 = parseFloat(estadoCalculadora.display);
    let resultado = 0;
    
    switch (estadoCalculadora.operacion) {
        case 'suma':
            resultado = num1 + num2;
            console.log(`${num1} + ${num2} = ${resultado}`);
            break;
        case 'multiplicacion':
            resultado = num1 * num2;
            console.log(`${num1} × ${num2} = ${resultado}`);
            break;
    }
    
    return resultado;
}

function mostrarResultado() {
    /*
     * Calcula y muestra el resultado
     */
    
    if (estadoCalculadora.operacion === null) {
        return;
    }
    
    const resultado = calcularResultado();
    estadoCalculadora.display = resultado.toString();
    estadoCalculadora.operacion = null;
    estadoCalculadora.valorAnterior = null;
    
    actualizarDisplay();
}

function limpiarCalculadora() {
    /*
     * Reinicia el estado de la calculadora
     */
    estadoCalculadora = {
        display: '0',
        operacion: null,
        valorAnterior: null
    };
    actualizarDisplay();
    elementos.noPermission.classList.add('hidden');
    console.log('Calculadora limpiada');
}

function actualizarDisplay() {
    /*
     * Actualiza el valor del display en la interfaz
     */
    elementos.display.value = estadoCalculadora.display;
}

// ========================================
// EVENT LISTENERS
// Configuración de eventos de la interfaz
// ========================================

// Evento: Envío del formulario de login
elementos.loginForm.addEventListener('submit', function(evento) {
    evento.preventDefault();
    
    const usuario = elementos.usernameInput.value.trim();
    const password = elementos.passwordInput.value;
    
    elementos.errorMessage.classList.add('hidden');
    
    if (!usuario || !password) {
        elementos.errorMessage.textContent = 'Por favor ingresa usuario y contraseña';
        elementos.errorMessage.classList.remove('hidden');
        return;
    }
    
    const datosUsuario = validarCredenciales(usuario, password);
    
    if (datosUsuario) {
        iniciarSesion(usuario.toLowerCase(), datosUsuario);
    } else {
        elementos.errorMessage.textContent = 'Usuario o contraseña incorrectos';
        elementos.errorMessage.classList.remove('hidden');
        console.log('Intento de login fallido para:', usuario);
    }
});

// Evento: Click en botón de cerrar sesión
elementos.logoutBtn.addEventListener('click', cerrarSesion);

// Eventos: Clicks en botones numéricos
elementos.botonesNum.forEach(boton => {
    boton.addEventListener('click', () => {
        agregarNumero(boton.dataset.num);
    });
});

// Evento: Click en botón de suma
elementos.btnSuma.addEventListener('click', () => {
    establecerOperacion('suma');
});

// Evento: Click en botón de multiplicación
elementos.btnMultiplicacion.addEventListener('click', () => {
    establecerOperacion('multiplicacion');
});

// Evento: Click en botón igual
elementos.btnIgual.addEventListener('click', mostrarResultado);

// Evento: Click en botón limpiar
elementos.btnLimpiar.addEventListener('click', limpiarCalculadora);

// ========================================
// INICIALIZACIÓN
// Código que se ejecuta al cargar la página
// ========================================

function verificarSesionGuardada() {
    /*
     * Verifica si hay una sesión guardada en localStorage
     * y la restaura si existe
     */
    const tokenGuardado = localStorage.getItem('authToken');
    const usuarioGuardado = localStorage.getItem('authUsuario');
    const permisosGuardados = localStorage.getItem('authPermisos');
    
    if (tokenGuardado && usuarioGuardado && permisosGuardados) {
        // Restaurar sesión
        sesionActual.token = tokenGuardado;
        sesionActual.usuario = usuarioGuardado;
        sesionActual.permisos = JSON.parse(permisosGuardados);
        
        const datosUsuario = USUARIOS[usuarioGuardado];
        if (datosUsuario) {
            mostrarCalculadora(datosUsuario);
            console.log('Sesión restaurada desde localStorage');
        }
    }
}

console.log('Sistema de Calculadora con Control de Acceso iniciado');
console.log('Usuarios disponibles:', Object.keys(USUARIOS));

// Verificar si hay sesión guardada al cargar
verificarSesionGuardada();
