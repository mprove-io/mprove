import { TagInterface } from '@malloydata/malloy-tag';
import { IsOptional, IsString } from 'class-validator';

export class KeyTagPair {
  @IsString()
  key: string;

  @IsOptional()
  tagInterface: TagInterface;
}
