import { IsArray, IsOptional, IsString } from 'class-validator';

export class AgentModelApi {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  providerId: string;

  @IsString()
  providerName: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variants?: string[];
}
