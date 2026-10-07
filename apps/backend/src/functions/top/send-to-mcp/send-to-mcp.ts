import request, { type Response, type Test } from 'supertest';
import { isDefined } from '#common/functions/is-defined/is-defined';

export async function sendToMcp(item: {
  httpServer: any;
  method: string;
  params?: {
    name: string;
    arguments: Record<string, any>;
  };
  apiKey?: string;
  protocolVersion?: string;
}): Promise<Response> {
  let { httpServer, method, params, apiKey, protocolVersion } = item;

  let rq: Test = request(httpServer).post('/api/mcp');

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

  if (isDefined(protocolVersion)) {
    rq = rq
      .set('MCP-Protocol-Version', protocolVersion)
      .set('Mcp-Method', method);

    if (isDefined(params)) {
      rq = rq.set('Mcp-Name', params.name);
    }

    body.params = {
      ...params,
      _meta: {
        'io.modelcontextprotocol/protocolVersion': protocolVersion,
        'io.modelcontextprotocol/clientCapabilities': {},
        'io.modelcontextprotocol/clientInfo': {
          name: 'mprove-e2e',
          version: '1.0.0'
        }
      }
    };
  }

  let response: Response = await rq
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json, text/event-stream')
    .send(body);

  return response;
}
