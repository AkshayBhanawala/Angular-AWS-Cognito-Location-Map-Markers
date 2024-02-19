export function maskEmail(email: string): string {
	return email.split('@').map((part) => part.replace(/^(.).*$/i, '$1***')).join('@');
}