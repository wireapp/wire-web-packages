import {initClient} from "./initClient";

(async () => {
  const apiClient = await initClient();
  const self = await apiClient.self.api.getSelf();
  console.info(`Logged in with handle "${self.handle}".`);
})().catch(error => {
  console.error(error);
  process.exit(1);
});