import { SwError } from './sw-error';
import { Model } from './model';
import { Dashboard } from './dashboard';
import { Mconfig } from './mconfig';
import { Query } from './query';
import { View } from './view';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StructFull {
  @ValidateNested()
  @Type(() => SwError)
  errors: SwError[];

  @ValidateNested()
  @Type(() => Model)
  models: Model[];

  @ValidateNested()
  @Type(() => View)
  views: View[];

  @ValidateNested()
  @Type(() => Dashboard)
  dashboards: Dashboard[];

  @ValidateNested()
  @Type(() => Mconfig)
  mconfigs: Mconfig[];

  @ValidateNested()
  @Type(() => Query)
  queries: Query[];
}
