import { Injectable } from '@nestjs/common';

@Injectable()
export class ExplorerToolsService {
  getTools(): Record<string, never> {
    return {};
  }
}
