import { Injectable } from '@nestjs/common';
import {
  buildFullMcpJson,
  type FullMcpJson
} from '#backend/functions/build-full-mcp-json';

@Injectable()
export class FullMcpJsonService {
  private cachedFullMcpJson: FullMcpJson | undefined;

  getFullMcpJsonCached(): FullMcpJson {
    if (this.cachedFullMcpJson === undefined) {
      this.cachedFullMcpJson = buildFullMcpJson();
    }
    return this.cachedFullMcpJson;
  }
}
