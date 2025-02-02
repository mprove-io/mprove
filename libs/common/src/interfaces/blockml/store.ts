import { IsInt, IsString } from 'class-validator';

export class Store {
  @IsString()
  structId: string;

  @IsString()
  storeId: string;

  @IsString()
  filePath: string;

  @IsString()
  label: string;

  @IsInt()
  serverTs: number;
}
