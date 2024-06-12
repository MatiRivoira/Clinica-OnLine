import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { inject } from "@angular/core";
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../../services/firestore.service';
import { LoadingComponent } from '../../loading/loading.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  showPassword: boolean = false;
  errMsgEmail!:string;
  errorStates = { email: false, pass: false };
  errMsg!:string;
  accesoRapido!:boolean;
  ngEmail!:string;
  ngPass!:string;
  errMsgPass!:string;
  @Input() redirect:boolean = true;
  @Output() register = new EventEmitter<any>();

  isLoading:boolean = false;

  toggleAccesoRapido():void{
    this.accesoRapido = !this.accesoRapido;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  constructor(private router:Router) {}

  ngOnInit(): void {
    this.authService.LogOut(this.redirect)
  }

  //?Login with firebase
  authService = inject(AuthService);
  firestoreService = inject(FirestoreService);

  async onSubmit(formData: any){
    this.errorStates = { email: false, pass: false };
    this.errMsgEmail = "";
    this.errMsg = "";
    this.errMsgPass = "";
    
    if (formData) {
      this.isLoading = true;
      this.authService.signIn(formData)
      .then((resp:any) => {
        this.isLoading = false;
        this.router.navigateByUrl("/home");
      })
      .catch(err => {
        console.log(err);
        this.isLoading = false;
        switch(err.code){
          case "auth/invalid-email":
            this.errMsgEmail = "Ingrese un correo electronico valido."
            this.errorStates.email = true;
            break;
          case "auth/invalid-credential":
            this.errMsg = "Correo y/o contraseña incorrecta."
            this.errorStates.email = true;
            this.errorStates.pass = true;
            break;
          case "auth/missing-email":
            this.errMsgEmail = "Ingrese el correo electronico.";
            this.errorStates.email = true;
            this.errMsgPass = "Ingrese la contraseña";
            this.errorStates.pass = true;
            break;
        }
        if (!err.code) {
          this.errMsgEmail = "El correo electronico no esta verificado."
          this.errorStates.email = true;
        }
      });
    }
  }

  autoFill(user:string) : void {
    switch (user) {
      case "user1":
        this.ngEmail = 'mgrivoira26@gmail.com';
        this.ngPass = '123123';
        break;
      case "user2":
        this.ngEmail = 'cogopox633@lapeds.com';
        this.ngPass = '123123';
        break;
      case "user3":
        this.ngEmail = 'weyigot425@morxin.com';
        this.ngPass = '123123';
        break;
    }
  }

  esperarYRedirigir(storage:string, detalle:any, url:string, intervalo:number = 50) {
    const idIntervalo = setInterval(() => {
        sessionStorage.setItem(storage, detalle);
        if (sessionStorage.getItem(storage) == detalle) {
            clearInterval(idIntervalo);
            this.router.navigateByUrl(url);
        }
    }, intervalo);
  }
}
