import { AfterViewChecked, Component, EventEmitter, Output } from '@angular/core';

@Component({
	selector: 'map-marker-custom-2',
	templateUrl: './map-marker-custom-2.component.svg',
	styleUrls: ['./map-marker-custom-2.component.scss'],
})
export class MapMarkerCustom2Component implements AfterViewChecked {
	@Output('onAfterViewChecked') onAfterViewChecked = new EventEmitter<boolean>();
	ngAfterViewChecked(): void {
		this.onAfterViewChecked.emit(true);
	}
}
