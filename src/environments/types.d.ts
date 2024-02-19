import { SignInOptions } from "@aws-amplify/auth/dist/esm/providers/cognito/types";
import { LegacyConfig } from "@aws-amplify/core/internals/utils";
import { ResourcesConfig } from "aws-amplify";

interface AWSConfig {
	region: string;
	amplifyConfig: ResourcesConfig | LegacyConfig;
	signInOptions: SignInOptions;
}

export interface Environment {
	environmentFile: string;
	production: boolean;
	aws: AWSConfig;
}
