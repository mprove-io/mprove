import { IsInt, IsString } from 'class-validator';

export class AgentSessionApi {
  @IsString()
  sessionId: string;

  @IsString()
  agent: string;

  @IsString()
  agentMode: string;

  @IsString()
  status: string;

  @IsInt()
  createdTs: number;

  @IsInt()
  lastActivityTs: number;

  firstMessage?: string;
}
