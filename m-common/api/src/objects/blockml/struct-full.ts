import { Model } from './model';
import { Dashboard } from './dashboard';
import { Mconfig } from './mconfig';
import { Query } from './query';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ErrorsPack } from './errors-pack';
import { ViewsPack } from './views-pack';

export class StructFull {
  @ValidateNested()
  @Type(() => ErrorsPack)
  errorsPack: ErrorsPack;

  @ValidateNested()
  @Type(() => ViewsPack)
  viewsPack: ViewsPack;
  // TODO: structFull udfsContent --> udfsDict, vizs

  // @ValidateNested()
  // @Type(() => Model)
  // models: Model[];

  // @ValidateNested()
  // @Type(() => Dashboard)
  // dashboards: Dashboard[];

  // @ValidateNested()
  // @Type(() => Mconfig)
  // mconfigs: Mconfig[];

  // @ValidateNested()
  // @Type(() => Query)
  // queries: Query[];
}
