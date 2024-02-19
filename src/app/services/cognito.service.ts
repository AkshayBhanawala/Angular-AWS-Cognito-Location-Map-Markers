import { Injectable, inject } from '@angular/core';
import { Amplify } from 'aws-amplify';
import { AuthSession } from '@aws-amplify/core/dist/esm/singleton/Auth/types';
import { signIn, signUp, signOut, confirmSignUp, getCurrentUser, AuthUser, ConfirmSignUpOutput, SignUpOutput, resendSignUpCode, ResendSignUpCodeOutput, SignInOutput, fetchAuthSession } from 'aws-amplify/auth';
import { environment } from 'src/environments/environment';

export interface IUser {
	email: string;
	password?: string;
	showPassword?: boolean;
	code?: string;
	name?: string;
}

export const ls_key_is_user_logged_in = 'IS_USER_LOGGED_IN';

@Injectable({
	providedIn: 'root',
})
export class CognitoService {

	constructor() {
		Amplify.configure(environment.aws.amplifyConfig);
	}

	public signUp(user: IUser): Promise<SignUpOutput> {
		return signUp({
			username: user.email,
			password: user.password || '',
		});
	}

	public confirmSignUp(user: IUser): Promise<ConfirmSignUpOutput> {
		return confirmSignUp({ username: user.email, confirmationCode: user.code || '' });
	}

	public resendSignUpCode(user: IUser): Promise<ResendSignUpCodeOutput> {
		return resendSignUpCode({ username: user.email });
	}

	public signIn(user: IUser): Promise<SignInOutput> {
		const signInRequest = signIn({
			username: user.email,
			password: user.password,
			options: { authFlowType: 'USER_PASSWORD_AUTH' }
		});
		signInRequest.then((res) => {
			if (res.isSignedIn) {
				localStorage.setItem(ls_key_is_user_logged_in, 'true');
			} else {
				localStorage.removeItem(ls_key_is_user_logged_in);
			}
		}).catch((err) => {
			console.log('CognitoService.signIn(): err', err)
			localStorage.removeItem(ls_key_is_user_logged_in);
		});
		return signInRequest;
	}

	public signOut(): Promise<void> {
		return signOut().then(() => {
			localStorage.removeItem(ls_key_is_user_logged_in);
		});
	}

	public getUser(): Promise<AuthUser> {
		const user = getCurrentUser();
		user.then((user) => {
			if (user) {
				localStorage.setItem(ls_key_is_user_logged_in, 'true');
			} else {
				localStorage.removeItem(ls_key_is_user_logged_in);
			}
		}).catch((err) => {
			console.log('CognitoService.getUser(): err', err)
			localStorage.removeItem(ls_key_is_user_logged_in);
		});
		return user;
	}

	public getUserSession(): Promise<AuthSession> {
		const session = fetchAuthSession();
		session.then(() => {
			localStorage.setItem(ls_key_is_user_logged_in, 'true');
		}).catch((err) => {
			console.log('CognitoService.getUserSession(): err', err)
			localStorage.removeItem(ls_key_is_user_logged_in);
		});
		return session;
	}

	public isAuthenticated(): Promise<boolean> {
		return this.getUser()
			.then((user) => {
				if (user) {
					return true;
				} else {
					return false;
				}
			}).catch(() => {
				return false;
			});
	}

	isUserLoggedIn(): boolean {
		return localStorage.getItem(ls_key_is_user_logged_in) === 'true';
	}

}
