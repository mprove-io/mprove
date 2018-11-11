const host = window.location.host;
const protocol = window.location.protocol;
const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';

// dynamic assets
let dynamicAssetsBaseUrl: string;

// console.log('ENV: ', ENV);
// console.log('LOCAL: ', LOCAL);

if (ENV === 'development') {
  dynamicAssetsBaseUrl = 'https://t.mprove.io';

} else if (ENV === 'production') {

  if (host === 'localhost:8088' || host === '192.168.1.105:8088' || host === '192.168.1.37:8088') {
    dynamicAssetsBaseUrl = LOCAL ? 'http://localhost:8080' : 'https://t.mprove.io';

  } else if (host === 'localhost:4201') {
    dynamicAssetsBaseUrl = 'https://e2e.mprove.io';

  } else {
    dynamicAssetsBaseUrl = `${protocol}//${host}`;
  }
}

// http
let httpUrl: string;

if (ENV === 'development') {
  httpUrl = 'https://t.mprove.io/api/v1';

} else if (ENV === 'production') {

  if (host === 'localhost:8088' || host === '192.168.1.105:8088' || host === '192.168.1.37:8088') {
    httpUrl = LOCAL ? 'http://localhost:8080/api/v1' : 'https://t.mprove.io/api/v1';

  } else if (host === 'localhost:4201') {
    httpUrl = 'https://e2e.mprove.io/api/v1';

  } else {
    httpUrl = `${protocol}//${host}/api/v1`;
  }
}

// websocket


let websocketUrl: string;
// TODO: change '?' to '/' in webchat urls

if (ENV === 'development') {
  websocketUrl = 'wss://t.mprove.io/api/v1/webchat?';

} else if (ENV === 'production') {

  if (host === 'localhost:8088' || host === '192.168.1.105:8088' || host === '192.168.1.37:8088') {
    websocketUrl = LOCAL ? 'ws://localhost:8080/api/v1/webchat/' : 'wss://t.mprove.io/api/v1/webchat?';

  } else if (host === 'localhost:4201') {
    websocketUrl = 'wss://e2e.mprove.io/api/v1/webchat?';

  } else {
    websocketUrl = `${wsProtocol}//${host}/api/v1/webchat?`;
  }
}


export let pathConfig = {
  staticAssetsBaseUrl: `${protocol}//${host}`,
  dynamicAssetsBaseUrl: dynamicAssetsBaseUrl,
  httpUrl: httpUrl,
  websocketUrl: websocketUrl,
};
