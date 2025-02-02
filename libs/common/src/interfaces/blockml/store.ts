import { IsString } from 'class-validator';

export class Store {
  @IsString()
  storeId: string;

  @IsString()
  filePath: string;
}
