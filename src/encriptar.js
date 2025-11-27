 import CryptoJS from "crypto-js";

 //esta clave no debe estar aqui
 const CLAVE = import.meta.env.VITE_CLAVE_ENCRIPTACION 

export const encriptar = (texto) => {
   return CryptoJS.AES.encrypt(texto, CLAVE).toString();
};

export const desencriptar = (texto) => {
    const bytes = CryptoJS.AES.decrypt(texto, CLAVE);
    return bytes.toString(CryptoJS.enc.Utf8);
 }