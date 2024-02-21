import { AfterViewChecked, Component, EventEmitter, Output } from '@angular/core';

@Component({
	selector: 'map-marker-amplify-maplibre-gl',
	templateUrl: './map-marker-amplify-maplibre-gl.component.svg',
	styleUrls: ['./map-marker-amplify-maplibre-gl.component.scss'],
})
export class MapMarkerAmplifyMapLibreGLComponent implements AfterViewChecked {
	@Output('onAfterViewChecked') onAfterViewChecked = new EventEmitter<boolean>();
	ngAfterViewChecked(): void {
		this.onAfterViewChecked.emit(true);
	}
}
