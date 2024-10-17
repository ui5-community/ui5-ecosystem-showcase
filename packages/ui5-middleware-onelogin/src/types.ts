export interface Options {
	configuration: {
		path?: string;
		subdirectory?: string;
		username?: string;
		password?: string;
		useCertificate: boolean;
		debug?: boolean;
		query?: unknown;
		clientCertificates?: Array<{
			origin: string;
			certPath?: string;
			cert?: Buffer;
			keyPath?: string;
			key?: Buffer;
			pfxPath?: string;
			pfx?: Buffer;
			passphrase?: string;
		}>;
	};
}
