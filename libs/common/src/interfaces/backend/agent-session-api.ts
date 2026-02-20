import { IsInt, IsOptional, IsString } from 'class-validator';

export class AgentSessionApi {
  @IsString()
  sessionId: string;

  @IsString()
  provider: string;

  @IsString()
  agent: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  lastMessageProviderModel?: string;

  @IsOptional()
  @IsString()
  lastMessageVariant?: string;

  @IsString()
  status: string;

  @IsInt()
  createdTs: number;

  @IsInt()
  lastActivityTs: number;

  firstMessage?: string;
}
