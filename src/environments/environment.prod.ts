const getEnv = (env: any) => {
  const value = process.env[env];
  if (typeof value === "undefined") {
    throw new Error(`${env} has not been set.`);
  }
  return value;
};

export const environment = {
  production: true,
  name: "prod",
  app_id: "abac5ec1095ce2a5032f865682a99745",
  server_url: "https://kagami-api.herokuapp.com/server",
};
