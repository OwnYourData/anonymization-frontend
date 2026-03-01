import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LandingComponent } from './components/landing/landing.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'landing', component: LandingComponent },
    { path: '**', redirectTo: '' }
];
