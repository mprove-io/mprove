import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Query } from '#common/interfaces/blockml/query';

export class RunTile {
  @IsString()
  title: string;

  @ValidateNested()
  @Type(() => Query)
  query: Query;
}
