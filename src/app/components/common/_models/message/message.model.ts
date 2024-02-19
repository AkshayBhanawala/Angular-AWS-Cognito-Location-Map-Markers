import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'app-model-message',
	templateUrl: './message.model.html',
	styleUrls: ['./message.model.scss']
})
export class Model_MessageComponent {
	showGenericErrorMessage: boolean;
	isMessageObject: boolean;
	constructor(@Inject(MAT_DIALOG_DATA) public data: { isError?: boolean, message?: unknown }) {
		console.log('[Model_MessageComponent] data:', data);
		if (typeof data?.message === "object") {
			this.showGenericErrorMessage = this.isMessageObject = true;
			data.message = JSON.stringify(data?.message, null, '\t');
		}
	}
}
