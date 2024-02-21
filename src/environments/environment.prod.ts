import { MAP_STYLES } from "maplibre-gl-js-amplify/lib/esm/constants";
import { Environment } from "./types";

const _environment: Environment = {
	environmentFile: 'environment.prod.ts',
	production: false,
	aws: {
		region: 'REGION GOES HERE',
		amplifyConfig: {
			Auth: {
				Cognito: {
					userPoolId: 'USER_POOL_ID GOES HERE',
					userPoolClientId: 'CLIENT ID GOES HERE',
					identityPoolId: 'IDENTITY_POOL_ID GOES HERE',
					signUpVerificationMethod: 'code',
					loginWith: { email: true, username: true },
					allowGuestAccess: true,
				}
			}
		},
		signInOptions: {
			authFlowType: 'USER_PASSWORD_AUTH',
		},
		mapResource: {
			mapName: 'YOUR MAP RESOURCE NAME GOES HERE',
			mapStyle: MAP_STYLES.ESRI_NAVIGATION, // YOUR MAP STYLE GOES HERE
			placeIndexName: 'YOUR PLACE INDEX NAME GOES HERE'
		},
	},
};

export const environment = Object.freeze(_environment);