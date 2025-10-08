import { DashboardField } from '~common/interfaces/blockml/dashboard-field';
import { Tile } from '~common/interfaces/blockml/tile';
import { DashboardEnt } from '../schema/dashboards';

export interface DashboardTab
  extends Omit<DashboardEnt, 'st' | 'lt'>,
    DashboardSt,
    DashboardLt {}

export class DashboardSt {
  title: string;
  filePath: string;
  accessRoles: string[];
  tiles: Tile[];
  fields: DashboardField[];
}

export class DashboardLt {
  content: any;
}
