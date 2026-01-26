import { IsBoolean, IsEnum, IsInt, IsString } from 'class-validator';
import { ChatEnvEnum } from '~common/enums/env/chat-env.enum';

export class ChatConfig {
  @IsEnum(ChatEnvEnum)
  chatEnv?: ChatEnvEnum;

  @IsString()
  chatZenKey?: string;

  @IsInt()
  chatConcurrency?: number;

  @IsString()
  chatValkeyHost?: string;

  @IsString()
  chatValkeyPassword?: string;

  @IsString()
  chatOpencodeHost?: string;

  @IsInt()
  chatOpencodePort?: number;

  @IsInt()
  chatOpencodeTimeout?: number;

  @IsBoolean()
  chatLogIsJson?: boolean;

  @IsBoolean()
  chatLogResponseError?: boolean;

  @IsBoolean()
  chatLogResponseOk?: boolean;
}
