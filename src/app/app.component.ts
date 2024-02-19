import { Component } from '@angular/core';
import { CognitoService } from './services/cognito.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	constructor(
		private router: Router,
		private cognitoService: CognitoService
	) {
		this.cognitoService.getUser();
	}
	get isLoggedIn(): boolean {
		return this.cognitoService.isUserLoggedIn();
	}
	onLogoutClick(): void {
		this.cognitoService.signOut().then(() => {
			this.router.navigate(['/']);
		});
	}
}
