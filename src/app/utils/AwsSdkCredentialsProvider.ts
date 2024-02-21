import { CredentialsAndIdentityId, CredentialsAndIdentityIdProvider } from '@aws-amplify/core';
import { CognitoService } from '../services/cognito.service';

export class AwsSdkCredentialsProvider implements CredentialsAndIdentityIdProvider {
	constructor(private cognitoService: CognitoService) {

	}
	async getCredentialsAndIdentityId(): Promise<CredentialsAndIdentityId | undefined> {
		return new Promise<CredentialsAndIdentityId>((resolve, reject) => {
			this.cognitoService.getAuthSession()
				.then(authSession => {
					if (authSession.credentials) {
						resolve({
							credentials: {
								accessKeyId: authSession.credentials.accessKeyId,
								secretAccessKey: authSession.credentials.secretAccessKey,
								sessionToken: authSession.credentials.sessionToken,
							},
						});
					} else {
						throw 'Credentials missing!'
					}
				}).catch((err) => {
					reject(err);
					return;
				});
		});
	}


	// Implement this to clear any cached credentials and identityId.
	clearCredentialsAndIdentityId(): void {
		//
	}
}
