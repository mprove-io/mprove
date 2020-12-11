import { IsString } from 'class-validator';

export class Timezone {
  @IsString()
  value: string;

  @IsString()
  name: string;
}
