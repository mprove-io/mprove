import { Tile } from '~common/interfaces/blockml/tile';
import { ChartEnt } from '../schema/charts';

export interface ChartTab
  extends Omit<ChartEnt, 'st' | 'lt'>,
    ChartSt,
    ChartLt {}

export class ChartSt {
  title: string;
  modelLabel: string;
  filePath: string;
  accessRoles: string[];
  tiles: Tile[];
}

export class ChartLt {
  emptyData?: number;
}
