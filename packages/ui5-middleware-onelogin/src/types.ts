export interface Options {
	configuration: {
		path?: string;
		subdirectory?: string;
		username?: string;
		password?: string;
		useCertificate: boolean;
		debug?: boolean;
		query?: unknown;
		certificateOrigin?: string;
		certificateCertPath?: string;
		certificateCert?: Buffer;
		certificateKeyPath?: string;
		certificateKey?: Buffer;
		certificatePfxPath?: string;
		certificatePfx?: Buffer;
		certificatePassphrase?: string;
	};
}
