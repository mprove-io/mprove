import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';

export class BaseConnection {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  connectionId?: string;

  @IsOptional()
  @IsString()
  envId?: string;

  @IsOptional()
  @IsEnum(ConnectionTypeEnum)
  type?: ConnectionTypeEnum;

  @IsString()
  st: string;

  @IsString()
  lt: string;
}
