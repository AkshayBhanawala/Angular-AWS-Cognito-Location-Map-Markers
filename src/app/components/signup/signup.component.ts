import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CognitoService, IUser } from 'src/app/services/cognito.service';
import { getConfirmPasswordValidator, getFormFieldErrorMessage, invalidFormDetailsValidator, otpValidatorHelper } from 'src/app/utils/form.util';
import { Model_OtpVerificationComponent, OtpVerificationInput } from '../common/_models/otp-verification/otp-verification.model';
import { showErrorDialog, showMessageDialog } from 'src/app/services/events.service';
import { SignUpOutput } from 'aws-amplify/auth';

@Component({
	selector: 'app-signup',
	templateUrl: './signup.component.html',
	styleUrls: ['./signup.component.scss']
})
export class SignUpComponent {
	showSpinner: boolean;
	signupForm = this.formBuilder.group({
		email: ['', [Validators.required, Validators.email]],
		password: ['', [Validators.required]],
		confirmPassword: ['', [Validators.required]],
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
		this.signupForm.valueChanges.subscribe(() => this.clearFormErrorValidator(this.signupForm));
		this.signupForm.controls.confirmPassword.addValidators(getConfirmPasswordValidator(this.signupForm.controls.password));
	}

	clearFormErrorValidator(control?: AbstractControl | FormGroup) {
		if (control?.dirty && this.signupForm.controls.form.hasValidator(invalidFormDetailsValidator)) {
			this.signupForm.controls.form.clearValidators();
			this.signupForm.controls.form.updateValueAndValidity();
		}
	}

	onSignUpFormSubmit(): void {
		this.showSpinner = true;
		this.signupForm.disable();
		if (!(this.signupForm?.value?.email && this.signupForm?.value?.password)) {
			alert('Fill email & password values');
			this.showSpinner = false;
			return;
		}
		const user: IUser = {
			email: this.signupForm.value.email,
			password: this.signupForm.value.password,
		};
		this.cognitoService.signUp(user)
			.then((res) => {
				console.log('SignUp response:', res);
				if (res.isSignUpComplete) {
					this.signUpComplete();
				} else {
					if (res.nextStep && res.nextStep.signUpStep !== 'DONE' && res.nextStep.codeDeliveryDetails) {
						this.openOtpVerificationModel(res, user);
					} else {
						showErrorDialog(this.dialog, { signUpError: { reason: 'Unhandled signUpStep', signUpResponse: res } });
					}
				}
			}).catch((err: Error) => {
				if (err.name === 'UsernameExistsException') {
					showErrorDialog(this.dialog, 'Email already registered');
				} else {
					showErrorDialog(this.dialog, err);
				}
				// this.signupForm.controls.form.setValidators(invalidFormDetailsValidator);
				// this.signupForm.markAsPristine();
				// this.signupForm.controls.form.updateValueAndValidity();
				this.signupForm.enable();
			}).finally(() => {
				console.log('SignUp finally');
				this.showSpinner = false;
			});
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
		this.otpVerificationDialogRef.afterClosed().subscribe(() => this.signupForm.enable());
	}

	cancelOtp(): void {
		console.log('[SignUpComponent]:', 'cancelOtp()');
	}

	signUpComplete() {
		const messageDialog = showMessageDialog(this.dialog, 'Registered for awesomeness! Login & get started now!');
		messageDialog.afterClosed().subscribe(() => {
			this.router.navigate(['/Login']);
		});
	}

}
