import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-button-with-spinner',
	templateUrl: './button-with-spinner.component.html',
	styleUrls: ['./button-with-spinner.component.scss']
})
export class ButtonWithSpinnerComponent {
	@Input() type? = 'button';
	@Input() matButtonType?: 'mat-button' | 'mat-raised-button' | 'mat-flat-button' | 'mat-stroked-button' = 'mat-button';
	@Input() matColor?: 'primary' | 'accent' | 'warn';
	@Input() disabled?: boolean;
	@Input() showSpinner?: boolean;
	@Output() clickEvent = new EventEmitter<MouseEvent>();

	handleClick(event: MouseEvent) {
		this.clickEvent.emit(event);
	}
}
