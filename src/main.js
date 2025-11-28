import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth"
import { doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore"
import { auth, db } from "./firebase"
//importar encriptador
import { encriptar } from "./encriptar";

document.addEventListener("DOMContentLoaded", function() {
    // Global error handlers to capture runtime errors in the browser
    window.addEventListener('error', function(e) {
        console.error('Global error event:', e.message, 'file:', e.filename, 'line:', e.lineno, 'col:', e.colno, 'error:', e.error);
    });
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
    });
    //console.log(auth)
    const caracteresA = [
    "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
    "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z",
    "0","1","2","3","4","5","6","7","8","9","~","`","!","@","#","$","%","^","&","*","(",")","_","-","+","=",
    "{","[","}","]",",","|",":",";","<",">",".","?","/"
    ];
    const caracteresN = document.getElementById("numCaracteres");
    const generarBtn = document.getElementById("generar-btn");
    const contraseña1 = document.getElementById("contraseña1");
    const nologinP = document.getElementById("nologin-p");
    const guardarBtn = document.getElementById("guardar-btn"); 
    const linkContras = document.getElementById("mostrar-contras");
    const modal = document.getElementById("login_form");
    const backdrop = document.getElementById("backdrop");
    const authBtn = document.getElementById("auth-btn");

    //botones del modal para guardar contraseña en BD
    const cancelarBtn = document.getElementById("btn-cancelar");
    const confirmarBtn = document.getElementById("btn-confirmar");
    const nombreClave = document.getElementById("nombre-input");

    const provider = new GoogleAuthProvider();
    //let estaLogueado = false
    const modalGuardar = document.getElementById("modal-guardar");
    let resultado = ""

    

    //onAuthChanged
    onAuthStateChanged(auth, (user)=>{
        if(user){
            console.log("usuario detectado")
            guardarBtn.removeAttribute("hidden");
            console.log(guardarBtn)
            linkContras.classList.remove("hidden");
        } else {
            //mostrar modal
            setTimeout(function() {
                //console.log("Mostrando el modal de inicio de sesión");
                showModal(modal);
            }, 1000);
            guardarBtn.setAttribute("hidden", true)
        }
    })
    //crear funcion encargada de manejar la autenticacion con Google
    async function manejarAutenticacion() {
        try {
            //console.log("About to call signInWithPopup. auth:", auth, "provider:", provider);
            const result = await signInWithPopup(auth, provider);
            //console.log("Iniciando autenticación con Google...");
            const usuario = result.user
            const usuarioRef = doc(db, "usuarios", usuario.uid)

            //verificar si existe en la bd
            const usuarioCap = await getDoc(usuarioRef)
            //console.log(usuarioCap)
            if(!usuarioCap.exists()){
                await setDoc(usuarioRef, {
                    nombre: usuario.displayName,
                    email: usuario.email,
                    foto: usuario.photoURL,
                    creado: new Date()
                })
                //console.log("usuario registrado en Firestore")
            } else {
                console.log("el usuario ya existia en la BD")
            }
            //console.log(`usuario logueado: ${result.user.displayName}`)
            const verificado = usuario.emailVerified
            //console.log(verificado)
            if(verificado){
                //estaLogueado = true
                hideModal(modal)
            }
            
        } catch(error){
            console.log(`Ha ocurrido un error en la autenticacion: ${error}`)
        }
    }
    //agregar event listener al boton de autenticacion
    authBtn.addEventListener("click", manejarAutenticacion)
    
    function showModal(modal) {
        if (!modal) return;
        modal.style.display = "block";
        document.body.classList.add("modal-open");
        if (backdrop) {
            backdrop.setAttribute("aria-hidden", "false");
        }
    }

    function hideModal(modal) {
        if (!modal) return;
        modal.style.display = "none";
        document.body.classList.remove("modal-open");
        caracteresN.focus();
        if (backdrop) {
            backdrop.setAttribute("aria-hidden", "true");
        }
    } 

    function generarContraseña() {
        let contraseñaGenerada = "";
        let numCaracteres = parseInt(caracteresN.value, 10);
        if (isNaN(numCaracteres) || numCaracteres <= 0 || numCaracteres >= 500) {
            alert("Por favor, ingresa un número válido de caracteres.");
            return;
        }

        for (let i = 0; i < numCaracteres; i++) {
            let randomId = Math.floor(Math.random() * caracteresA.length);
            let randomCaracter = caracteresA[randomId];
            contraseñaGenerada += randomCaracter;
        }

        contraseña1.textContent = contraseñaGenerada;

        // Habilitar el botón sólo si se generó una contraseña válida
        if (guardarBtn && contraseñaGenerada.trim().length > 0) {
            guardarBtn.removeAttribute("disabled");
        }

        return contraseñaGenerada;
    }
    if (caracteresN) {
        // Escuchar Enter sólo cuando el input de número de caracteres está enfocado
        caracteresN.addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                const resultado = generarContraseña();
                //console.log("Contraseña generada: " +  resultado);
            }
        });
    }
    
    function copiarContra() {
        resultado = contraseña1.textContent;
        resultado = resultado.trim()
        //console.log(resultado)
        if (resultado.length <= 3) return;
        navigator.clipboard.writeText(resultado)
            .then(() => {
                console.log("Contraseña copiada al portapapeles: " + resultado);
                
            })
            .catch(err => {
                console.error("Error al copiar la contraseña: ", err);
            });
    }
    if (contraseña1) {
        contraseña1.addEventListener("click", copiarContra);
    }
    if (generarBtn) {
        generarBtn.addEventListener("click", generarContraseña);
    }

    if (nologinP) {
        nologinP.addEventListener("click", function(){
            console.log("continuar sin iniciar sesion")
            hideModal(modal)
        });
    }
    //Agregar funcionalidad para mostrar y ocultar modal de inicio de sesion
    function mostrarModalGuardar() {
        if (!modalGuardar || contraseña1.textContent.length <= 3){
            alert("Aun no hay una contraseña para guardar")
        } else {
            modalGuardar.style.display = "flex";
            document.body.classList.add("modal-open");
            if (backdrop) {
                backdrop.setAttribute("aria-hidden", "false");
            }
        }
    }
    //boton guardar contraseña para mostrar el modal (añadir handler sólo si existe)
    if (guardarBtn) {
        guardarBtn.addEventListener("click", mostrarModalGuardar);
    }
    if(cancelarBtn){
        cancelarBtn.addEventListener("click", function(){
            nombreClave.value = ""
            hideModal(modalGuardar)
        })
    }

    /*
    function ocultar() {
        if (!modal) return;
        modal.style.display = "none";
        document.body.classList.remove("modal-open");
        caracteresN.focus();
        if (backdrop) {
            backdrop.setAttribute("aria-hidden", "true");
        }
    }*/
    
  
    //TODO: Implementar la funcionalidad de guardar contraseñas en la base de datos
    async function guardarEnFirebase(){
        const nombre = nombreClave.value
        const clave = contraseña1.textContent.trim()
        const usuario = auth.currentUser

        if(!nombre){
            alert("Debes escribir un nombre para la contraseña")
            return
        }

        try{
            const claveRef = collection(db, "usuarios", usuario.uid, "claves");

            await addDoc(claveRef, {
                nombre: nombre,
                clave: encriptar(clave),
                fecha: new Date()
            });
            console.log("Contraseña guardada en Firestore")
            hideModal(modalGuardar)
            nombreClave.value = ""
            contraseña1.textContent = "..."
        } catch(error){
            console.log("Error al guardar: ", error)
        }
    }
    confirmarBtn.addEventListener("click", guardarEnFirebase);
    //TODO: Obtener y mostrar contraseñas guardadas para el usuario autenticado
    //TODO: arreglar border radius de los inputs
});
