import { AfterViewChecked, Component, EventEmitter, Output } from '@angular/core';

@Component({
	selector: 'map-marker-custom-1',
	templateUrl: './map-marker-custom-1.component.svg',
	styleUrls: ['./map-marker-custom-1.component.scss'],
})
export class MapMarkerCustom1Component implements AfterViewChecked {
	@Output('onAfterViewChecked') onAfterViewChecked = new EventEmitter<boolean>();
	ngAfterViewChecked(): void {
		this.onAfterViewChecked.emit(true);
	}
}
