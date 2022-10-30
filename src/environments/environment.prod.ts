const getEnv = (env: any) => {
  const value = process.env[env];
  if (typeof value === 'undefined') {
    throw new Error(`${env} has not been set.`);
  }
  return value;
};

export const environment = {
  production: true,
  name: 'prod',
  app_id: getEnv('MORALIS_APP_ID'),
  server_url: getEnv('MORALIS_SERVER_URL'),
  chain: getEnv('CHAIN'),
  token_address: getEnv('TOKEN_ADDRESS') // In case we use a tokens
};
