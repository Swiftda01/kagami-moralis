// const getEnv = (env: any) => {
//   const value = process.env[env];
//   if (typeof value === 'undefined') {
//     throw new Error(`${env} has not been set.`);
//   }
//   return value;
// };

export const environment = {
	production: true,
	name: 'prod',
	app_id: 'MNEusDu408KQqu2ykkDAAWqq5Nx4vlD2WgFju3HW',
	server_url: 'https://xqxpqhhliubf.usemoralis.com:2053/server',
	chain: null,
	token_address: null // In case we use a tokens
};
