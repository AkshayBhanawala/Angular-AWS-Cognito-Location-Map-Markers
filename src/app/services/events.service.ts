import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Model_MessageComponent } from "../components/common/_models/message/message.model";

export function showMessageDialog(dialog: MatDialog, message?: unknown): MatDialogRef<Model_MessageComponent, unknown> {
	console.log('message:', message);
	if (message instanceof Error) {
		delete message.stack;
	}
	return dialog.open(Model_MessageComponent, {
		enterAnimationDuration: 100,
		exitAnimationDuration: 100,
		data: { message },
	});
}

export function showErrorDialog(dialog: MatDialog, message?: unknown): MatDialogRef<Model_MessageComponent, unknown> {
	console.log('message:', message);
	if (message instanceof Error) {
		console.log('message.name:', message.name);
		console.log('message.message:', message.message);
		console.log('message.cause:', message.cause);
		// console.log('message.stack:', errorMessage.stack);
		delete message.stack;
	}
	return dialog.open(Model_MessageComponent, {
		enterAnimationDuration: 100,
		exitAnimationDuration: 100,
		data: { isError: true, message },
	});
}