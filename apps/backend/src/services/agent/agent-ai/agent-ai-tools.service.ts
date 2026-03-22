import { Injectable } from '@nestjs/common';

@Injectable()
export class AgentAiToolsService {
  getTools(): Record<string, never> {
    return {};
  }
}
