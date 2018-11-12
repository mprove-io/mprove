import { environment } from '@env/environment';

// const host = window.location.host;
// const protocol = window.location.protocol;
// const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';

export let pathConfig = {
  // staticAssetsBaseUrl: `${protocol}//${host}`,
  staticAssetsBaseUrl: environment.staticAssetsBaseUrl,
  dynamicAssetsBaseUrl: environment.dynamicAssetsBaseUrl,
  httpUrl: environment.httpUrl,
  websocketUrl: environment.websocketUrl,
};
