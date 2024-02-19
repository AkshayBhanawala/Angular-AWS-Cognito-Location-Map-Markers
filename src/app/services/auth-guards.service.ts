import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { CognitoService } from "./cognito.service";

export function getAuthGuard_UnAuthenticated_CanActivateFn(): CanActivateFn {
	return async () => {
		const cognitoService = inject(CognitoService);
		const router = inject(Router);
		if (!(await cognitoService.isAuthenticated())) {
			return true;
		}
		router.navigate(['/Map']);
		return false;
	};
}

export function getAuthGuard_Authenticated_CanActivateFn(): CanActivateFn {
	return async () => {
		const cognitoService = inject(CognitoService);
		const router = inject(Router);
		if (await cognitoService.isAuthenticated()) {
			return true;
		}
		router.navigate(['/']);
		return false;
	};
}
