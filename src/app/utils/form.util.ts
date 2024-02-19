import { AbstractControl, FormControl, FormGroup, ValidationErrors } from "@angular/forms";
import { CognitoService, IUser } from "../services/cognito.service";
import { ConfirmSignUpOutput, ResendSignUpCodeOutput } from "aws-amplify/auth";
import { MatDialogRef } from "@angular/material/dialog";
import { Model_OtpVerificationComponent } from "../components/common/_models/otp-verification/otp-verification.model";

export const FORM_INVALID_DETAILS_ERROR_KEY = 'invalidDetails';

export function getConfirmPasswordValidator(passwordControl: AbstractControl): (control: AbstractControl) => ValidationErrors | null {
	return function confirmPasswordValidator(control: AbstractControl): ValidationErrors | null {
		if (control?.touched && control?.value !== passwordControl?.value) {
			return { passwordNotMatching: true };
		}
		return null;
	}
}

export function invalidFormDetailsValidator() {
	return { [FORM_INVALID_DETAILS_ERROR_KEY]: true };
}

export function getFormFieldErrorMessage(formControl: FormControl | FormGroup) {
	if (formControl.hasError('invalidDetails')) {
		return 'Oh no! wrong details mate!';
	}
	if (formControl.hasError('required')) {
		return 'Value missing? Fill the void!';
	}
	if (formControl.hasError('email')) {
		return 'Typocalypse! Fix and re-enter.';
	}
	if (formControl.hasError('passwordNotMatching')) {
		return 'No match! Just like your love life!';
	}
	return '';
}

export function otpValidatorHelper(
	user: IUser,
	cognitoService: CognitoService,
	otpVerificationDialogRef: MatDialogRef<Model_OtpVerificationComponent, string>,
	signUpCompleteCallback: () => void,
	cancelCallback: () => void
) {
	return {
		submitOtp,
		resendOtp,
		cancelOtp,
	};
	function submitOtp(code: string | number): Promise<ConfirmSignUpOutput> {
		console.log('[SignupComponent]:', 'submitOtp()');
		if (!code || !user?.email) {
			return Promise.reject('OTP or email empty');
		}
		return new Promise((resolve, reject) => {
			cognitoService.confirmSignUp({
				email: user.email || '',
				code: code.toString()
			}).then(res => {
				console.log('confirmSignUp response:', res);
				if (res.isSignUpComplete) {
					otpVerificationDialogRef.close();
					signUpCompleteCallback();
					return resolve(res);
				}
				reject({ signUpError: { reason: 'Unhandled confirmSignUp response', confirmSignUpResponse: res } });
			}).catch((err) => {
				if (err.name === 'CodeMismatchException') {
					reject(`Ohh no!, this is not the right one, you should [CTRL + C, CTRL + V] the code!`);
				} else if (err.name === 'ExpiredCodeException') {
					reject(`Bruh!, It's expired now, resend the code and submit it fast next time.`);
				} else {
					reject(err);
				}
			}).finally(() => {
				console.log('submitOtp finally');
			});
		});
	}

	function resendOtp(): Promise<ResendSignUpCodeOutput> {
		console.log('[SignupComponent]:', 'resendOtp()');
		if (!user?.email) {
			return Promise.reject('Email empty');
		}
		return new Promise((resolve, reject) => {
			cognitoService.resendSignUpCode({ email: user.email || '' })
				.then(res => {
					console.log('resendSignUpCode response:', res);
					return resolve(res);
				}).catch((err) => {
					if (err.name === 'LimitExceededException') {
						reject('Woahhh! slow down champ, too many tries, now wait a while before trying again!');
					} else {
						reject(err);
					}
				}).finally(() => {
					console.log('resendOtp finally');
				});
		});
	}

	function cancelOtp(): void {
		console.log('[SignupComponent]:', 'cancelOtp()');
		cancelCallback();
	}
}