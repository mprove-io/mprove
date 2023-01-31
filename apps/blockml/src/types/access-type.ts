import { interfaces } from '~blockml/barrels/interfaces';

export type accessType =
  | interfaces.Model
  | interfaces.Dashboard
  | interfaces.Viz
  | interfaces.Rep;
