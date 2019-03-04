import { interfaces } from '../../barrels/interfaces';

export async function sendWsAsync(item: {
  ws_client: interfaces.WebsocketClient;
  content: any;
}) {
  return new Promise((resolve, reject) => {
    item.ws_client.ws.send(item.content, function ack(e: any) {
      // If error is not defined, the send has been completed, otherwise the error
      // object will indicate what failed.
      if (e) {
        reject(e);
      } else {
        resolve();
      }
    });
  });
}
