export interface Options {
	configuration: {
		path?: string;
		subdirectory?: string;
		username?: string;
		password?: string;
		useCertificate: boolean;
		debug?: boolean;
		query?: any;
	};
}
