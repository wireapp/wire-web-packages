import {APIClient} from "../APIClient";
import {LoginData} from "../auth";
import {ClientType} from "../client";
import {Config} from "../Config";

require('dotenv').config();

export async function initClient(): Promise<APIClient> {
  const credentials: LoginData = {
    clientType: ClientType.TEMPORARY,
    email: process.env.WIRE_EMAIL,
    password: process.env.WIRE_PASSWORD,
  };

  const apiConfig: Config = {
    urls: {
      rest: process.env.WIRE_BACKEND_REST!,
      ws: process.env.WIRE_BACKEND_WS!
    }
  };

  const apiClient = new APIClient(apiConfig);

  await apiClient.login(credentials);

  return apiClient;
}