import request from 'supertest';
import { isDefined } from '#common/functions/is-defined';

export async function sendToMcp(item: {
  httpServer: any;
  method: string;
  params?: {
    name: string;
    arguments: Record<string, any>;
  };
  apiKey?: string;
}) {
  let { httpServer, method, params, apiKey } = item;

  let rq = request(httpServer).post('/api/mcp');

  if (isDefined(apiKey)) {
    rq = rq.auth(apiKey, { type: 'bearer' });
  }

  let body: Record<string, any> = {
    jsonrpc: '2.0',
    id: 1,
    method: method
  };

  if (isDefined(params)) {
    body.params = params;
  }

  let response = await rq
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json, text/event-stream')
    .send(body);

  return response;
}
