import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class AxShadow {
  @IsBoolean()
  enabled: boolean;

  @IsString()
  color: string;

  @IsNumber()
  xOffset: number;

  @IsNumber()
  yOffset: number;

  @IsNumber()
  blur: number;
}
