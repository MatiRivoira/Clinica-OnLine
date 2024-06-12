import { Injectable, inject } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Router } from "@angular/router";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { FirestoreService } from "./firestore.service";
import { FireStorageService } from "./firestorage.service";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    auth = inject(AngularFireAuth);
    router = inject(Router);
    firestore = inject(FirestoreService);
    firestorage = inject(FireStorageService);

    getAuth(){
        return getAuth();
    }
    
    signIn(user:any): Promise<boolean | Error> {
        return this.auth.signInWithEmailAndPassword(user.email, user.password)
        .then((userCredential) => {
            if (userCredential.user && userCredential.user.emailVerified) {
                console.log("Inicio de sesión exitoso.");
                return true;
            } else {
                throw new Error("El correo electrónico no ha sido verificado.");
            }
        })
        .catch((error) => {
            // Manejar errores de inicio de sesión
            console.error("Error al iniciar sesión:", error);
            throw error; // Lanza el error para que pueda ser capturado por el código que llama a esta función
        });
    }
    

    async signUp(user: any, img: any, img2: any) {
        const userCredential = await this.auth.createUserWithEmailAndPassword(user.email, user.password);
        const uid = userCredential.user?.uid;
        
        // Subir la primera imagen
        const imageUrl = await this.firestorage.uploadImage("usersProfiles", `${uid}.${img.type.split("/")[1]}`, img).toPromise();
        user.img = imageUrl;
    
        // Subir la segunda imagen si existe
        if (img2 && user.userType === "paciente") {
            const imageUrl2 = await this.firestorage.uploadImage("usersProfiles", `${uid}_2.${img2.type.split("/")[1]}`, img2).toPromise();
            user.img2 = imageUrl2;
        }
    


        // Agregar el usuario a Firestore
        await this.firestore.addDocument("users", user, uid);
    
        // Enviar el correo de verificación
        await userCredential.user?.sendEmailVerification();
        
        return true;
    }
    

    sendRecoveryEmail(email: string) {
        return sendPasswordResetEmail(getAuth(), email);
    }

    LogOut(redirect:boolean = true) {
        this.auth.signOut().then(() => {
            if (redirect) {
                this.router.navigateByUrl('/login');
            }
        });
    }

    getUser() {
        return this.auth.authState;
    }
}