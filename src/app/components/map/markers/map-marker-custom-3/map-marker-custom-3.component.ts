import { AfterViewChecked, Component, EventEmitter, Output } from '@angular/core';

@Component({
	selector: 'map-marker-custom-3',
	templateUrl: './map-marker-custom-3.component.svg',
	styleUrls: ['./map-marker-custom-3.component.scss'],
})
export class MapMarkerCustom3Component implements AfterViewChecked {
	@Output('onAfterViewChecked') onAfterViewChecked = new EventEmitter<boolean>();
	ngAfterViewChecked(): void {
		this.onAfterViewChecked.emit(true);
	}
}
