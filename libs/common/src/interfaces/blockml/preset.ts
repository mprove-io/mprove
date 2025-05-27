import { IsString } from 'class-validator';

export class Preset {
  @IsString()
  presetId: string;

  @IsString()
  path: string;

  parsedContent: any;
}
