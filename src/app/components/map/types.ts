import { FitBoundsOptions } from "maplibre-gl";

/**
 * Map config
 */
export interface MapConfig {
	/**
	 * Marker color
	 */
	markerColor?: string;
	/**
	 * Source name for Default MapGL Amplify Marker
	 */
	mapLibreAmplifyMarkersSourceName: string;
	/**
	 * Type of Map marker to use
	 * Must initialized customMarkerVariant, if `MAP_MARKER_TYPES.CUSTOM` is selected
	 */
	markerType: MAP_MARKER_TYPE;
	/**
	 * If Map Marker is CUSTOM, then which Variant of the custom map markers to use
	 * Must be initialized if markerType is `MAP_MARKER_TYPES.CUSTOM`
	 * @default CUSTOM_MAP_MARKERS.CUSTOM_HTML_1
	 */
	customMarkerVariant?: CUSTOM_MAP_MARKER; //
	/**
	 * Get Bounding options for the map when markers are added
	 * @param markerType Which marker type is used
	 * @param customMarkerVariant If marker type is `MAP_MARKER_TYPES.CUSTOM`, which custom marker variant is used
	 */
	getMapBoundingOptions?(markerType?: MAP_MARKER_TYPE, customMarkerVariant?: CUSTOM_MAP_MARKER): FitBoundsOptions;
}


export enum MAP_MARKER_TYPE {
	/**
	 * Default marker from MapLibre GL Library \
	 * Can show numbers
	 */
	MAPLIBRE_GL_DEFAULT = 'MAPLIBRE_GL_DEFAULT',
	/**
	 * Default marker from MapLibre GL Amplify Library \
	 * CAN NOT show numbers
	 */
	MAPLIBRE_GL_AMPLIFY_DEFAULT = 'MAPLIBRE_GL_AMPLIFY_DEFAULT',
	/**
	 * Custom HTML
	 * Available variants are defined in {@link CUSTOM_MAP_MARKER} \
	 * Can show numbers
	 * @default CUSTOM_MAP_MARKERS.CUSTOM_HTML_1
	 */
	CUSTOM_HTML = 'CUSTOM_HTML',
}

export enum CUSTOM_MAP_MARKER {
	/**
	 * Custom map marker - Variant 1 \
	 * Can show numbers
	 * This is the default Marker if `MAP_MARKER_TYPES.CUSTOM` is used
	 */
	CUSTOM_HTML_1 = 'CUSTOM_HTML_1',
	/**
	 * Custom map marker - Variant 2 \
	 * Can show numbers
	 */
	CUSTOM_HTML_2 = 'CUSTOM_HTML_2',
	/**
	 * Custom map marker - Variant3 \
	 * Can show numbers
	 */
	CUSTOM_HTML_3 = 'CUSTOM_HTML_3',
	/**
	 * Default marker from MapLibre GL Amplify Library modified to show numbers \
	 * Can show numbers
	 */
	MAPLIBRE_GL_AMPLIFY = 'MAPLIBRE_GL_AMPLIFY',
}
