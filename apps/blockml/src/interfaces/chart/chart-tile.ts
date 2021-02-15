import { common } from '~blockml/barrels/common';

export interface ChartTile {
  tile_width: common.ChartTileWidthEnum;
  tile_width_line_num: number;

  tile_height: common.ChartTileHeightEnum;
  tile_height_line_num: number;

  view_size: common.ChartViewSizeEnum;
  view_size_line_num: number;

  view_width: string; // number
  view_width_line_num: number;

  view_height: string; // number
  view_height_line_num: number;
}
