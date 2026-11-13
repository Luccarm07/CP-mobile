import AsyncStorage from "@react-native-async-storage/async-storage"
import { getApp, getApps, initializeApp } from "firebase/app"
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Configuração do app Web registrado no Console do Firebase
// (Visão geral do projeto > Configurações do projeto > Seus apps).
//
// Esses dados NÃO são secretos: eles identificam o projeto e ficam dentro de qualquer
// app publicado. Quem protege os dados são as regras do Firestore (firestore.rules),
// que exigem login e só liberam cada documento para quem tem permissão.
const firebaseConfig = {
    apiKey: "AIzaSyCS6E33aZpYiGbWhfs6A93lfGq5m49EOrQ",
    authDomain: "quem-comeu-meu-iogurte.firebaseapp.com",
    projectId: "quem-comeu-meu-iogurte",
    storageBucket: "quem-comeu-meu-iogurte.firebasestorage.app",
    messagingSenderId: "289180909726",
    appId: "1:289180909726:web:fd17afa9ea68db7101fb8f",
}

// getApps() evita inicializar duas vezes durante o Fast Refresh
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// Persistência no AsyncStorage: o usuário continua logado ao fechar e abrir o app.
function createAuth(): Auth {
    try {
        return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
    } catch {
        // Durante o Fast Refresh o Auth já existe; reaproveitamos a instância.
        return getAuth(app)
    }
}

export const auth = createAuth()
export const db = getFirestore(app)
