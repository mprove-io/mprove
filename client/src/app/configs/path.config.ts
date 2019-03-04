import { environment } from '@env/environment';

const host = window.location.host;
const protocol = window.location.protocol;
// const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';

export let pathConfig = {
  devEmailLinkBaseUrl: `${protocol}//${host}`,
  staticAssetsBaseUrl: `${protocol}//${host}`,
  dynamicAssetsBaseUrl:
    environment.local || environment.dev
      ? 'http://localhost:8080'
      : `https://${host}`,
  httpUrl:
    environment.local || environment.dev
      ? 'http://localhost:8080/api/v1'
      : `https://${host}/api/v1`,
  websocketUrl:
    environment.local || environment.dev
      ? 'ws://localhost:8080/api/v1/webchat/'
      : `wss://${host}/api/v1/webchat/`
};
