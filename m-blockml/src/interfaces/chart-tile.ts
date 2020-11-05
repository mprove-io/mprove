import { api } from '../barrels/api';

export interface ChartTile {
  tileWidth: api.ChartTileWidthEnum;
  tileWidthLineNum: number;

  tileHeight: api.ChartTileHeightEnum;
  tileHeightLineNum: number;

  viewSize: api.ChartViewSizeEnum;
  viewSizeLineNum: number;

  viewWidth: string; // number
  viewWidthLineNum: number;

  viewHeight: string; // number
  viewHeightLineNum: number;
}
