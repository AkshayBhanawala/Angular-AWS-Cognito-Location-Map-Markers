import { AfterViewInit, Component, ElementRef, EventEmitter, OnChanges, OnInit, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Amplify, ResourcesConfig } from '@aws-amplify/core';
import { Geo } from '@aws-amplify/geo';
import { SearchByTextOptions, Place } from '@aws-amplify/geo/dist/esm/types/Geo';
import { LegacyConfig } from '@aws-amplify/core/internals/utils';
import { FitBoundsOptions, LngLatBounds, Map, MapOptions, Marker, NavigationControl } from 'maplibre-gl';
import { createAmplifyGeocoder, createMap, drawPoints } from 'maplibre-gl-js-amplify';
import { NamedLocation } from 'maplibre-gl-js-amplify/lib/esm/types';
import { DrawPointsOutput } from 'maplibre-gl-js-amplify/lib/esm/drawPoints';
import { MAP_STYLES } from 'maplibre-gl-js-amplify/lib/esm/constants';
import { environment } from 'src/environments/environment';
import { MapMarkerCustom1Component } from './markers/map-marker-custom-1/map-marker-custom-1.component';
import { MapMarkerCustom2Component } from './markers/map-marker-custom-2/map-marker-custom-2.component';
import { MapMarkerCustom3Component } from './markers/map-marker-custom-3/map-marker-custom-3.component';
import { MapMarkerAmplifyMapLibreGLComponent } from './markers/map-marker-amplify-maplibre-gl/map-marker-amplify-maplibre-gl.component';
import { CUSTOM_MAP_MARKER, MAP_MARKER_TYPE, MapConfig } from './types';

/**
 * Custom map marker classes defined in their respective components
 */
export const CUSTOM_MAP_MARKER_CLASSES = Object.freeze({
	[CUSTOM_MAP_MARKER.CUSTOM_HTML_1]: 'map-marker-custom-1',
	[CUSTOM_MAP_MARKER.CUSTOM_HTML_2]: 'map-marker-custom-2',
	[CUSTOM_MAP_MARKER.CUSTOM_HTML_3]: 'map-marker-custom-3',
	[CUSTOM_MAP_MARKER.MAPLIBRE_GL_AMPLIFY]: 'map-marker-maplibre-gl',
});

const AWS_LOCATION_SERVICE_ADDRESS_SEARCH_OPTIONS: SearchByTextOptions = {
	providerName: 'AmazonLocationService',
	countries: ['USA'],
	language: 'EN',
};

const MAP_CONFIG: MapConfig = {
	markerColor: '#E74B3C',
	mapLibreAmplifyMarkersSourceName: 'Map_Libre_Amplify_Markers',
	markerType: MAP_MARKER_TYPE.CUSTOM_HTML,
	customMarkerVariant: CUSTOM_MAP_MARKER.CUSTOM_HTML_1,
	getMapBoundingOptions: (
		_markerType = MAP_CONFIG.markerType,
		_customMarkerVariant = MAP_CONFIG.customMarkerVariant
	) => {
		const options: FitBoundsOptions = {
			maxZoom: 14,
			padding: {
				bottom: 50,
				top: 50,
				left: 50,
				right: 70,
			},
			duration: 1500,
		};
		// Modify this to specify custom padding based on used marker
		// const amplifyPaddingOptions = {
		// 	top: 35,
		// };
		// if (_markerType === MAP_MARKER_TYPES.DEFAULT_MAP_GL_AMPLIFY
		// 	|| (_markerType === MAP_MARKER_TYPES.CUSTOM && _customMarkerVariant === CUSTOM_MAP_MARKERS.AMPLIFY_MAPLIBRE_GL)
		// ) {
		// 	options.padding = Object.assign(options.padding, amplifyPaddingOptions);
		// }
		return options;
	},
};

@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, AfterViewInit, OnChanges {
	@ViewChild('map') private mapContainer!: ElementRef<HTMLDivElement>;
	inputAddresses: string[];
	map: Map;
	mapStyle: string;
	mapInitialState: Partial<MapOptions> = {
		container: undefined,
		center: {
			lng: -73.6546634,
			lat: 45.4859129,
		},
		zoom: 14,
		interactive: true,
	};
	addOnClickFixedLocations: {
		currentIndex: number
		locations: NamedLocation[]
	} = {
			currentIndex: 0,
			locations: [
				{
					title: 'Location 1',
					address: 'Location 1, Location 1, Location 1, Location 1, Location 1, Location 1, US',
					coordinates: [-74.020253, 45.779222],
				},
				{
					title: 'Location 2',
					address: 'Location 2, Location 2, Location 2, Location 2, Location 2, Location 2, US',
					coordinates: [-69.656862, 47.702024],
				},
				{
					title: 'Location 3',
					address: 'Location 3, Location 3, Location 3, Location 3, Location 3, Location 3, US',
					coordinates: [-61.9720506, 46.452625],
				},
			]
		};
	mapMarkers: Marker[] = [];
	namedLocations: NamedLocation[] = [];
	mapDrawPoints: DrawPointsOutput;
	mapBounds = new LngLatBounds();
	locationSearches: { [x: string]: Promise<Place[]> | Place | undefined } = {};
	drawPointInitEventEmitter: EventEmitter<boolean>;
	bufferDrawPoints: NamedLocation[] = [];

	constructor(
		private route: ActivatedRoute,
		private readonly viewContainerRef: ViewContainerRef
	) {
		this.mapStyle = `https://maps.geo.${environment.aws.region}.amazonaws.com/maps/v0/maps/${environment.aws.mapResource.mapName}/style-descriptor`;
	}

	ngOnInit(): void {
		this.route.data.forEach((data) => {
			if (data['inputAddresses']) {
				this.inputAddresses = data['inputAddresses'];
				this.ngOnChanges({});
			}
		})
		this.configureAmplify();
	}

	ngAfterViewInit(): void {
		this.initMap();
	}

	/**
	 * Track changes
	 * @param changes
	 */
	ngOnChanges(changes: SimpleChanges): void {
		console.log('changes:', changes);
		/**
		 * Handle input locations changes
		 */
		if (this.inputAddresses?.length) {
			// console.info('apptLocations:', this.apptLocations);
			this.inputAddresses.forEach((address, i) => {
				if (address) {
					if (this.locationSearches[address]) {
						/**
						 * Location already exist in previously searched locations,
						 * 	and it should already be present in the Map as a Marker/DrawPoint,
						 * 	so there is no need to do anything.
						 */
					} else {
						this.locationSearches[address] = this.searchByAddress(address);
						(this.locationSearches[address] as Promise<Place[]>)
							.then(res => {
								if (res?.length) {
									const firstSearchResult = res[0];
									this.locationSearches[address] = firstSearchResult;
									const firstNamedLocation = placeToNamedLocation(firstSearchResult, address, address);
									this.addLocationMarkerInMap(firstNamedLocation, i + 1);
								} else {
									console.warn('Location not found:', address);
								}
							})
							.catch(error => {
								console.error(error);
								this.locationSearches[address] = undefined;
							});
					}
				} else {
					console.warn('Location address not searchable:', address);
				}
			});
		} else {
			/**
			 * There is no need to check for removal of a Marker/DrawPoint from map,
			 * 	because there is no such functionality in MyEHE Schedular yet
			 * 	to remove a location that is already added.
			 */
		}

		/**
		 * Turn Place result to NamedLocation for showing it in map
		 * @param place
		 * @param titleOverride
		 * @param addressOverride
		 * @returns
		 */
		function placeToNamedLocation(place: Place, titleOverride?: string, addressOverride?: string) {
			return {
				title: titleOverride,
				coordinates: place.geometry?.point,
				address: addressOverride,
			} as NamedLocation;
		}
	}

	/**
	 * Amplify configuration with credentials and Location Service config
	 */
	configureAmplify(): void {
		console.info('env:', environment);
		Amplify.configure(
			{
				...Amplify.getConfig(),
				Geo: {
					LocationService: {
						maps: {
							items: {
								[environment.aws.mapResource.mapName]: {
									// REQUIRED - Amazon Location Service Map resource name
									style: MAP_STYLES.ESRI_NAVIGATION, // REQUIRED - String representing the style of map resource
									// Other Styles: https://docs.aws.amazon.com/location/latest/APIReference/API_MapConfiguration.html
								},
							},
							default: environment.aws.mapResource.mapName, // REQUIRED - Amazon Location Service Map resource name to set as default
						},
						searchIndices: {
							items: [environment.aws.mapResource.placeIndexName], // REQUIRED - Amazon Location Service Place Index name
							default: environment.aws.mapResource.placeIndexName, // REQUIRED - Amazon Location Service Place Index name to set as default
						},
						// NOTE: THERE IS A BUG IN AWS LIBRARY SO NEED TO ADD THE SAME `searchIndices` as `search_indices`
						search_indices: {
							items: [environment.aws.mapResource.placeIndexName], // REQUIRED - Amazon Location Service Place Index name
							default: environment.aws.mapResource.placeIndexName, // REQUIRED - Amazon Location Service Place Index name to set as default
						},
						region: environment.aws.region, // REQUIRED - Amazon Location Service Region
					},
				},
			} as ResourcesConfig | LegacyConfig,
			// {
			// 	Auth: { credentialsProvider: new AwsSdkCredentialsProvider() },
			// }
		);
	}

	/**
	 * Initiate Map
	 */
	async initMap(): Promise<void> {
		try {
			this.map = await createMap({
				container: this.mapContainer.nativeElement,
				style: this.mapStyle,
				center: this.mapInitialState.center,
				zoom: this.mapInitialState.zoom,
				interactive: this.mapInitialState.interactive,
				attributionControl: false,
				// transformRequest: await getMapRequestTransformerForAuth(),
			});
			this.addMapControls();
			this.onClickAddMarker();
			if (MAP_CONFIG.markerType === MAP_MARKER_TYPE.MAPLIBRE_GL_AMPLIFY_DEFAULT) {
				this.initDrawPoints();
			}
		} catch (error) {
			console.error(error);
		}

		// Not needed as of now because we are using AWS global credential config through Amplify for authentication
		// Though I'd personally suggest to keep this function for future reference/needs as it's hard to come by this code
		/**
		 * A higher-order function for signing request URL with AWS signer
		 * @returns a function that accepts base URL of 'amazonaws.com' and returns a pre-signed URL
		 */
		// async function getMapRequestTransformerForAuth(): Promise<RequestTransformFunction> {
		// 	const credentials = (await new AwsSdkCredentialsProvider().getCredentialsAndIdentityId()).credentials;
		// 	return (url: string) => {
		// 		// Only sign aws URLs
		// 		if (url.includes('amazonaws.com')) {
		// 			return {
		// 				url: presignUrl(
		// 					{ url: new URL(url) },
		// 					{
		// 						credentials: {
		// 							accessKeyId: credentials.accessKeyId,
		// 							secretAccessKey: credentials.secretAccessKey,
		// 							sessionToken: credentials.sessionToken,
		// 						},
		// 						signingRegion: this.env.AWS_REGION,
		// 						signingService: 'geo',
		// 					}
		// 				).toString(),
		// 			};
		// 		}
		// 	};
		// }
	}

	/**
	 * Add map controls in map
	 */
	addMapControls(): void {
		this.map.addControl(
			new NavigationControl({ showCompass: true, showZoom: true, visualizePitch: true }),
			'top-right'
		);
		// Add search controls
		this.map.addControl(createAmplifyGeocoder());
	}

	/**
	 * Initialize Draw Points in the map for AmpLibre Amplify Markers
	 */
	initDrawPoints(): void {
		this.map.on('load', () => {
			this.mapDrawPoints = drawPoints(MAP_CONFIG.mapLibreAmplifyMarkersSourceName, this.namedLocations, this.map, {
				showCluster: false,
				// clusterOptions: { showCount: true, smThreshold: 1, mdThreshold: 3, lgThreshold: 5 },
				unclusteredOptions: { showMarkerPopup: true, defaultColor: MAP_CONFIG.markerColor },
				autoFit: true,
			});
			this.drawPointInitEventEmitter?.emit(true);
		});
	}

	/**
	 * Add Map marker on when clicking on map
	 */
	onClickAddMarker(): void {
		this.map.on('click', e => {
			console.log('Map Click Event:', e);
			this.addLocationMarkerInMap({ coordinates: [e.lngLat.lng, e.lngLat.lat] });
		});
	}

	/**
	 * Add Map marker on button click
	 */
	handleAddPredefinedLocationClick(): void {
		if (this.addOnClickFixedLocations.currentIndex < this.addOnClickFixedLocations.locations.length) {
			const nextLocation = this.addOnClickFixedLocations.locations[this.addOnClickFixedLocations.currentIndex];
			this.addLocationMarkerInMap(nextLocation, this.addOnClickFixedLocations.currentIndex + 1, CUSTOM_MAP_MARKER.MAPLIBRE_GL_AMPLIFY);
			this.addOnClickFixedLocations.currentIndex++;
		} else {
			this.addOnClickFixedLocations.currentIndex = 0;
			this.removeAllMapMarkers();
		}
	}

	/**
	 * Search place(s) on AWS Location Service using Map Index
	 * @param addressStr Address to search for
	 * @returns Promise of places found with given address string
	 */
	searchByAddress(addressStr: string): Promise<Place[]> | undefined {
		if (addressStr) {
			return Geo.searchByText(addressStr, AWS_LOCATION_SERVICE_ADDRESS_SEARCH_OPTIONS);
		}
		return undefined;
	}

	/**
	 * Add location marker in the map
	 * @param namedLocation Named Location to add in the Map
	 * @param number Number to show on marker, if any
	 * @param customMarkerType Marker Type if you want to specify a different custom marker
	 */
	addLocationMarkerInMap(namedLocation: NamedLocation, number?: number, customMarkerType?: MAP_MARKER_TYPE.MAPLIBRE_GL_DEFAULT | CUSTOM_MAP_MARKER): void {
		const markerTypeToUse = customMarkerType || MAP_CONFIG.markerType;
		if (markerTypeToUse === MAP_MARKER_TYPE.MAPLIBRE_GL_AMPLIFY_DEFAULT) {
			// Marker from Maplibre GL Amplify Library
			if (this.mapDrawPoints) {
				this.namedLocations.push(namedLocation);
				this.mapDrawPoints.setData([...this.namedLocations]);
			} else {
				if (!this.drawPointInitEventEmitter) {
					this.drawPointInitEventEmitter = new EventEmitter<boolean>();
					this.drawPointInitEventEmitter.asObservable().forEach(() => {
						this.namedLocations.push(...this.bufferDrawPoints);
						this.mapDrawPoints.setData([...this.bufferDrawPoints]);
						this.drawPointInitEventEmitter.complete();
					});
					this.bufferDrawPoints.push(namedLocation);
				}
			}
		} else if (markerTypeToUse === MAP_MARKER_TYPE.MAPLIBRE_GL_DEFAULT) {
			// Marker from MapLibre GL Library
			const marker = this.getMapGlMarker(namedLocation, number);
			this.mapMarkers.push(marker);
			marker.addTo(this.map);
		} else {
			const customMarkerVariant = (customMarkerType as CUSTOM_MAP_MARKER) || MAP_CONFIG.customMarkerVariant;
			this.getCustomMapMarkerHTML(customMarkerVariant).then(markerHtml => {
				const marker = this.getMapGlMarker(namedLocation, number, markerHtml);
				this.mapMarkers.push(marker);
				marker.addTo(this.map);
			});
		}
		this.mapBounds.extend(namedLocation.coordinates);
		if (MAP_CONFIG.getMapBoundingOptions) {
			this.map.fitBounds(this.mapBounds, MAP_CONFIG.getMapBoundingOptions());
		}
	}

	/**
	 * Get MapLibre GL Marker for given Named Location, may show a number and/or use a custom HTML Marker
	 * @param namedLocation Named location
	 * @param number Number to sho on marker
	 * @param customHtml Custom HTML for the marker
	 */
	getMapGlMarker(namedLocation: NamedLocation, number?: number, customHtml?: HTMLElement): Marker {
		let marker: Marker;
		if (customHtml) {
			marker = new Marker({ element: customHtml, anchor: 'bottom' });
		} else {
			marker = new Marker({ color: MAP_CONFIG.markerColor });
		}
		marker.setLngLat(namedLocation.coordinates);
		if (number && Number.isInteger(number)) {
			const markerHTML = marker.getElement();
			markerHTML.setAttribute('data-number', number.toString());
			// console.log(markerHTML);
		}
		return marker;
	}

	/**
	 * Get div element for a MapLibre Amplify marker with number
	 * @param number Number to show on marker
	 * @returns An HTMLElement containing elements for a MapLibre Amplify Map marker with number
	 */
	getCustomMapMarkerHTML(customMarkerVariant: CUSTOM_MAP_MARKER = CUSTOM_MAP_MARKER.CUSTOM_HTML_1): Promise<HTMLElement> {
		const markerComponent = getMarkerComponent();
		const markerComponentRef = this.viewContainerRef.createComponent(markerComponent);
		const eventObserver = markerComponentRef.instance.onAfterViewChecked.asObservable();
		return new Promise<HTMLElement>(resolve => {
			eventObserver.subscribe((componentNumber: boolean) => {
				const htmlString = markerComponentRef.location.nativeElement.innerHTML as string;
				if (componentNumber) {
					markerComponentRef.instance.onAfterViewChecked.complete();
					markerComponentRef.destroy();

					const markerDiv = document.createElement('div');
					markerDiv.classList.add(getMarkerClass());
					markerDiv.innerHTML = htmlString.replace(/_ngcontent-ng-[A-z0-9]+=""\s/gi, '');
					resolve(markerDiv);
				}
			});
		});

		function getMarkerComponent():
			| typeof MapMarkerCustom1Component
			| typeof MapMarkerCustom2Component
			| typeof MapMarkerCustom3Component
			| typeof MapMarkerAmplifyMapLibreGLComponent {
			switch (customMarkerVariant) {
				case CUSTOM_MAP_MARKER.CUSTOM_HTML_1:
					return MapMarkerCustom1Component;
				case CUSTOM_MAP_MARKER.CUSTOM_HTML_2:
					return MapMarkerCustom2Component;
				case CUSTOM_MAP_MARKER.CUSTOM_HTML_3:
					return MapMarkerCustom3Component;
				case CUSTOM_MAP_MARKER.MAPLIBRE_GL_AMPLIFY:
					return MapMarkerAmplifyMapLibreGLComponent;
			}
			return MapMarkerCustom1Component;
		}

		function getMarkerClass(): string {
			return CUSTOM_MAP_MARKER_CLASSES[customMarkerVariant];
		}
	}

	/**
	 * Remove all markers from the map
	 */
	removeAllMapMarkers(): void {
		this.mapBounds = new LngLatBounds();
		if (MAP_CONFIG.markerType === MAP_MARKER_TYPE.MAPLIBRE_GL_AMPLIFY_DEFAULT) {
			// Remove markers added as draw points through MapLibreGL Amplify Library
			this.mapDrawPoints.setData([]);
			this.namedLocations.length = 0;
		} else {
			// Remove markers added through MapLibreGL Map APIs
			this.mapMarkers.forEach(marker => marker.remove());
			this.mapMarkers.length = 0;
		}
	}
}
