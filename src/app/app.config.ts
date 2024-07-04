import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

//?Firebase Authentication
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from "@angular/fire/compat";
import { AngularFirestoreModule } from "@angular/fire/compat/firestore";

import { routes } from './app.routes';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

const firebaseConfig = {
  apiKey: "AIzaSyB48Efk0VQquHIIO7UB6ai2fWWu_TO3Qfw",
  authDomain: "posible-parcial.firebaseapp.com",
  projectId: "posible-parcial",
  storageBucket: "posible-parcial.appspot.com",
  messagingSenderId: "606689585377",
  appId: "1:606689585377:web:da9d154a22b03181612fa0"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    importProvidersFrom(
      AngularFireModule.initializeApp(firebaseConfig),
      HttpClientModule,
      AngularFirestoreModule
    ), provideCharts(withDefaultRegisterables()), provideCharts(withDefaultRegisterables())
  ]
};
