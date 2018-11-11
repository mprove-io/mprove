import * as enums from 'src/app/enums/_index';
import { Dry } from 'src/app/interfaces/dry';

export interface LayoutState {
  project_id: string;
  mode: enums.LayoutModeEnum;
  mconfig_id: string;
  model_id: string;
  query_id: string;
  chart_id: string;
  dashboard_id: string;
  file_id: string;
  need_save: boolean;
  dry: Dry;
  last_ws_msg_ts: number;
}
