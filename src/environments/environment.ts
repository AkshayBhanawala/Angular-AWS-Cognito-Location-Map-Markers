import { Environment } from "./types";

const _environment: Environment = {
	environmentFile: 'environment.ts',
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
		}
	}
};

export const environment = Object.freeze(_environment);