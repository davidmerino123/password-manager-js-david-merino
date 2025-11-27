import { doc, onSnapshot, query, deleteDoc, orderBy, collection } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
//importar desencriptar
import { desencriptar } from "./encriptar";

document.addEventListener("DOMContentLoaded", function(){
    //referencia al elemento lista
    const listaEl = document.getElementById("lista-claves");

    //escucha global del estado del usuario
    onAuthStateChanged(auth, (user) => {
        if(user){
            console.log("usuario detectado", user.email);
            cargarContraseñas(user);
            //console.log(user)
        } else {
            console.warn("No hay usuario autenticado. Redirigiendo...");
            window.location.href = "index.html";
        }
    })
    function cargarContraseñas(user){
        const coleccionRef = collection(db, "usuarios", user.uid, "claves");
        const q = query(coleccionRef, orderBy("fecha", "desc"));

        //escucha en tiempo real
        onSnapshot(q, (snapshot) => {
            listaEl.innerHTML = ""
            if(snapshot.empty){
                listaEl.innerHTML = "<p>Aun no tienes contraseñas guardadas.</p>"
                return
            } else {
                snapshot.forEach((docSnap) =>{
                    //data es una funcion
                    const data = docSnap.data();
                    const docId = docSnap.id;
                    //console.log(docId)
                    //crear el elemento li
                    const li = document.createElement("li")
                    li.className = "item"
                    li.innerHTML = `
                        <div class="info">
                            <strong>${data.nombre}</strong>
                            <br>
                            <input 
                            id="${docId}"
                            type="password" 
                            value="${desencriptar(data.clave)}" 
                            class="input-mostrar" 
                            size="164"
                            readonly
                            >
                            
                        </div>
                        <div class="botones">
                            <button class="btn-ver btn" title="Mostrar/Ocultar">👁️</button>
                            <button class="btn-copiar btn" title="Copiar">📋​</button>
                            <button class="btn-eliminar" title="Eliminar">🗑️</button>
                        </div>
                    `
                    listaEl.appendChild(li);
                    //usar li.querySelector para que busque solo en el nuevo elemento li que se ha creado
                    const borrarBtn = li.querySelector(".btn-eliminar")
                    const copiarBtn = li.querySelector(".btn-copiar");
                    //agregar event listener para eliminarbtn
                    borrarBtn.addEventListener("click", ()=> borrarContraseña(user.uid, docId))
                    //event listener para copiar contraseña
                    copiarBtn.addEventListener("click", () => copiarContra(docId));
                    //logica para ver y ocultar la contraseña
                    const btnVer = li.querySelector(".btn-ver");
                    const inputContraseña = li.querySelector(".input-mostrar");

                    btnVer.addEventListener("click", ()=>{
                        if(inputContraseña.type === "password"){
                            inputContraseña.type = "text"
                            btnVer.textContent = "🙈"
                        } else {
                            inputContraseña.type = "password"
                            btnVer.textContent = "👁️"
                        }
                    })
                    //console.log(inputContraseña.type)
                })
            }
        })
    }

    async function borrarContraseña(uid, docId) {
        if(confirm("¿Estas seguro que deseas eliminar esta contraseña?")){
            try{
                const docRef = doc(db, "usuarios", uid, "claves", docId);
                await deleteDoc(docRef);
            }
            catch(error){
                console.log("Error al borrar elemento: ", error);
            }
        }
    }
    //funcion para copiar contraseña al portapapeles
    function copiarContra(docId){
        const elementoCopiar = document.getElementById(`${docId}`).value.trim()
        navigator.clipboard.writeText(elementoCopiar);
        try{
            console.log("Contraseña copiada al portapapeles: ", elementoCopiar)
        }
        catch(error){
            console.log("Ocurrio un error al copiar la contraseña", error)
        }
        //console.log(elementoCopiar)

    }
})
