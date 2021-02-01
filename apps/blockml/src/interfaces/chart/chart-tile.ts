import { api } from '~blockml/barrels/api';

export interface ChartTile {
  tile_width: api.ChartTileWidthEnum;
  tile_width_line_num: number;

  tile_height: api.ChartTileHeightEnum;
  tile_height_line_num: number;

  view_size: api.ChartViewSizeEnum;
  view_size_line_num: number;

  view_width: string; // number
  view_width_line_num: number;

  view_height: string; // number
  view_height_line_num: number;
}
