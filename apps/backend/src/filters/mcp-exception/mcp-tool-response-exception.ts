import { RpcException } from '@nestjs/microservices';

// A protocol-only signal for the Nest MCP exception boundary. Domain errors
// remain typed Results until makeMcpToolResponse formats their public code.
export class McpToolResponseException extends RpcException {
  constructor(item: { message: string }) {
    let { message } = item;

    super({ status: 'error', message: message });
  }
}
