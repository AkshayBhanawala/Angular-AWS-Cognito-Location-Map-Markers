import { SignInOptions } from "@aws-amplify/auth/dist/esm/providers/cognito/types";
import { LegacyConfig } from "@aws-amplify/core/internals/utils";
import { ResourcesConfig } from "aws-amplify";
import { MAP_STYLES } from "maplibre-gl-js-amplify/lib/esm/constants";

interface AWSConfig {
	region: string;
	amplifyConfig: ResourcesConfig | LegacyConfig;
	signInOptions: SignInOptions;
	mapResource: {
		mapName: string,
		mapStyle: MAP_STYLES,
		placeIndexName: string,
	}
}

export interface Environment {
	environmentFile: string;
	production: boolean;
	aws: AWSConfig;
}
