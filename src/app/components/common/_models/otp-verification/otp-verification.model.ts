import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ConfirmSignUpOutput, ResendSignUpCodeOutput } from 'aws-amplify/auth';
import { showErrorDialog } from 'src/app/services/events.service';
import { getFormFieldErrorMessage } from 'src/app/utils/form.util';

export class OtpVerificationInput {
	otpMethod?: string;
	otpDestination?: string;
	submitCallback?: (value: number | string) => Promise<ConfirmSignUpOutput>;
	cancelCallback?: () => void;
	resendOtpCallback?: () => Promise<ResendSignUpCodeOutput>;
	constructor(input?: OtpVerificationInput) {
		if (input?.otpMethod) {
			this.otpMethod = input.otpMethod;
		}
		if (input?.otpDestination) {
			this.otpDestination = input.otpDestination;
		}
		if (input?.submitCallback) {
			this.submitCallback = input.submitCallback;
		}
		if (input?.cancelCallback) {
			this.cancelCallback = input.cancelCallback;
		}
		if (input?.resendOtpCallback) {
			this.resendOtpCallback = input.resendOtpCallback;
		}
	}
}

@Component({
	selector: 'app-model-otp-verification',
	templateUrl: './otp-verification.model.html',
	styleUrls: ['./otp-verification.model.scss']
})
export class Model_OtpVerificationComponent implements OnInit {
	input: OtpVerificationInput;
	otpMethod: string;
	otpDestination: string;
	showSpinner: boolean;
	isOtpResendCoolDown: boolean;
	otpResendCoolDownTime = 120; // 2 Minutes
	otpResendCoolDownCount: number;
	otp = new FormControl<number | null>(null, [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern('^[0-9]{6}$')]);
	getFormFieldErrorMessage = getFormFieldErrorMessage;

	constructor(
		private dialog: MatDialog,
		@Inject(MAT_DIALOG_DATA) public data?: OtpVerificationInput,
	) { }

	ngOnInit(): void {
		console.log('[Model_OtpVerificationComponent] data:', this.data);
	}

	onSubmitClick(): void {
		if (
			this.data?.submitCallback
			&& typeof this.isFunction(this.data?.submitCallback)
			&& this.otp.valid
			&& this.otp.value
		) {
			this.showSpinner = true;
			this.otp.disable();
			this.data?.submitCallback(this.otp.value)
				.catch((err) => {
					showErrorDialog(this.dialog, err);
				}).finally(() => {
					this.otp.enable();
					this.showSpinner = false;
				});
			return;
		}
	}

	onCancelClick(): void {
		if (this.data?.cancelCallback && typeof this.isFunction(this.data?.cancelCallback)) {
			this.data?.cancelCallback();
		}
	}

	onResendOtpClick(): void {
		if (this.isOtpResendCoolDown || this.showSpinner) {
			return;
		}
		if (this.data?.resendOtpCallback && typeof this.isFunction(this.data?.resendOtpCallback)) {
			this.showSpinner = true;
			this.otp.disable();
			this.data?.resendOtpCallback()
				.then((res) => {
					this.otpMethod = res.attributeName || res.deliveryMedium || this.otpMethod;
					this.otpDestination = res.destination || this.otpDestination;
					this.isOtpResendCoolDown = true;
					this.otpResendCoolDownCount = this.otpResendCoolDownTime;
					const otpResetCoolDownInterval = setInterval(() => {
						if (this.otpResendCoolDownCount <= 0) {
							clearInterval(otpResetCoolDownInterval);
							this.isOtpResendCoolDown = false;
							return;
						}
						this.otpResendCoolDownCount--;
					}, 1000);
				}).catch((err) => {
					showErrorDialog(this.dialog, err);
				}).finally(() => {
					this.otp.enable();
					this.showSpinner = false;
				});
		}
	}

	getSecondsToMinutes(totalSeconds: number): string {
		const minutes = Math.floor(totalSeconds / 60).toString();
		const seconds = (totalSeconds % 60).toString();
		return `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
	}

	isFunction(value: unknown): boolean {
		return (!!value) && typeof value === 'function';
	}

}
