import { IsInt, IsOptional, IsString } from 'class-validator';

export class AgentSessionApi {
  @IsString()
  sessionId: string;

  @IsString()
  agent: string;

  @IsString()
  agentMode: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsString()
  status: string;

  @IsInt()
  createdTs: number;

  @IsInt()
  lastActivityTs: number;

  firstMessage?: string;
}
