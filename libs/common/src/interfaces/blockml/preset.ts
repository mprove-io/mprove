import { IsString } from 'class-validator';

export class Preset {
  @IsString()
  presetId: string;

  @IsString()
  label: string;

  @IsString()
  path: string;

  parsedContent: any;
}
