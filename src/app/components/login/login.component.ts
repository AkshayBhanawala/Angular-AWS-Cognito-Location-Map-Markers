import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SignUpOutput } from 'aws-amplify/auth';
import { CognitoService, IUser } from 'src/app/services/cognito.service';
import { showErrorDialog, showMessageDialog } from 'src/app/services/events.service';
import { getFormFieldErrorMessage, invalidFormDetailsValidator, otpValidatorHelper } from 'src/app/utils/form.util';
import { maskEmail } from 'src/app/utils/general.util';
import { Model_OtpVerificationComponent, OtpVerificationInput } from '../common/_models/otp-verification/otp-verification.model';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss']
})
export class LoginComponent {
	showSpinner: boolean;
	loginForm = this.formBuilder.group({
		email: ['', [Validators.required, Validators.email]],
		password: ['', [Validators.required]],
		form: [''],
	});
	otpVerificationDialogRef: MatDialogRef<Model_OtpVerificationComponent, string>;
	getFormFieldErrorMessage = getFormFieldErrorMessage;

	constructor(
		private router: Router,
		private formBuilder: FormBuilder,
		private cognitoService: CognitoService,
		private dialog: MatDialog,
	) {
		this.loginForm.valueChanges.subscribe(() => this.clearFormErrorValidator(this.loginForm));
		this.cognitoService.signOut();
	}

	clearFormErrorValidator(control?: AbstractControl | FormGroup) {
		if (control?.dirty && this.loginForm.controls.form.hasValidator(invalidFormDetailsValidator)) {
			this.loginForm.controls.form.clearValidators();
			this.loginForm.controls.form.updateValueAndValidity();
		}
	}

	onLoginFormSubmit(): void {
		this.showSpinner = true;
		this.loginForm.disable();
		if (!(this.loginForm?.value?.email && this.loginForm?.value?.password)) {
			alert('Fill email & password values');
			this.showSpinner = false;
			return;
		}
		const user: IUser = {
			email: this.loginForm.value.email,
			password: this.loginForm.value.password,
		};
		this.cognitoService.signIn(user)
			.then((res) => {
				console.log('Login response:', res);
				if (res.isSignedIn) {
					this.router.navigate(['/Map']);
				} else {
					if (res.nextStep.signInStep === 'CONFIRM_SIGN_UP') {
						const fakeSignUpOutput = this.getFakeOtpSignUpOutput(user);
						this.openOtpVerificationModel(fakeSignUpOutput, user);
					}
				}
			}).catch((err: Error) => {
				if (err.name === 'UserNotConfirmedException') {
					const fakeSignUpOutput = this.getFakeOtpSignUpOutput(user);
					this.openOtpVerificationModel(fakeSignUpOutput, user);
				} else if (err.name === 'NotAuthorizedException') {
					this.loginForm.controls.form.setValidators(invalidFormDetailsValidator);
					this.loginForm.markAsPristine();
					this.loginForm.controls.form.updateValueAndValidity();
					this.loginForm.enable();
				} else {
					showErrorDialog(this.dialog, err);
					this.loginForm.enable();
				}
			}).finally(() => {
				console.log('Login finally');
				this.showSpinner = false;
			});
	}

	getFakeOtpSignUpOutput(user: IUser): SignUpOutput {
		return {
			isSignUpComplete: false,
			nextStep: {
				signUpStep: 'CONFIRM_SIGN_UP',
				codeDeliveryDetails: {
					attributeName: 'email',
					deliveryMedium: 'EMAIL',
					destination: maskEmail(user.email),
				}
			}
		};
	}

	openOtpVerificationModel(res: SignUpOutput, user: IUser) {
		if (res.nextStep && res.nextStep.signUpStep === 'DONE') {
			return;
		}
		this.otpVerificationDialogRef = this.dialog.open(Model_OtpVerificationComponent, {
			enterAnimationDuration: 100,
			exitAnimationDuration: 100,
			minWidth: 400,
		});
		const otpHelperFunctions = otpValidatorHelper(user, this.cognitoService, this.otpVerificationDialogRef, this.signUpComplete.bind(this), this.cancelOtp.bind(this));
		const otpVerificationInput = new OtpVerificationInput({
			otpMethod: res?.nextStep?.codeDeliveryDetails?.attributeName || res?.nextStep?.codeDeliveryDetails?.deliveryMedium || 'email',
			otpDestination: res?.nextStep?.codeDeliveryDetails?.destination || user.email,
			resendOtpCallback: otpHelperFunctions.resendOtp,
			submitCallback: otpHelperFunctions.submitOtp,
			cancelCallback: otpHelperFunctions.cancelOtp,
		});
		this.otpVerificationDialogRef.componentInstance.data = otpVerificationInput;
		this.otpVerificationDialogRef.afterClosed().subscribe(() => this.loginForm.enable());
	}

	cancelOtp(): void {
		console.log('[LoginComponent]:', 'cancelOtp()');
	}

	signUpComplete() {
		console.log('signUpComplete');
		showMessageDialog(this.dialog, 'Verification complete! you can login now!');
		this.onLoginFormSubmit();
	}

}
