import type { Provider } from '@nestjs/common';
import {
  MCP_HTTP_HANDLER,
  MCP_STRATEGY,
  type McpHttpHandler,
  McpStrategy,
  StreamableHttpTransport
} from '@rekog/mcp-nest';
import { backendPackageJson } from '#backend/backend-package-json';

export const mcpProviders: Provider[] = [
  {
    provide: StreamableHttpTransport,
    useFactory: (): StreamableHttpTransport => {
      let transport: StreamableHttpTransport = new StreamableHttpTransport({
        enableJsonResponse: true
      });

      return transport;
    }
  },
  {
    provide: MCP_HTTP_HANDLER,
    inject: [StreamableHttpTransport],
    useFactory: (transport: StreamableHttpTransport): McpHttpHandler => {
      let handlers: McpHttpHandler = transport.httpHandlers;

      return handlers;
    }
  },
  {
    provide: MCP_STRATEGY,
    inject: [StreamableHttpTransport],
    useFactory: (transport: StreamableHttpTransport): McpStrategy => {
      let strategy: McpStrategy = new McpStrategy({
        name: 'mprove',
        version: backendPackageJson.version,
        transports: [transport]
      });

      return strategy;
    }
  }
];
