import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';

export type accessType =
  | interfaces.Model
  | interfaces.Dashboard
  | interfaces.Viz
  | common.FileRep;
