import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignUpComponent } from './components/signup/signup.component';
import { MapComponent } from './components/map/map.component';
import { getAuthGuard_Authenticated_CanActivateFn, getAuthGuard_UnAuthenticated_CanActivateFn } from './services/auth-guards.service';

const routes: Routes = [
	{ path: '', component: LoginComponent, canActivate: [getAuthGuard_UnAuthenticated_CanActivateFn()] },
	{ path: 'Login', redirectTo: '' },
	{ path: 'SignUp', component: SignUpComponent, canActivate: [getAuthGuard_UnAuthenticated_CanActivateFn()] },
	{ path: 'Map', component: MapComponent, canActivate: [getAuthGuard_Authenticated_CanActivateFn()] },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule { }
