import { common } from '~blockml/barrels/common';
import { FileBasic } from '~blockml/interfaces/file/file-basic';

export interface Conf extends FileBasic {
  week_start?: common.ProjectWeekStartEnum;
  week_start_line_num?: number;

  default_timezone?: string;
  default_timezone_line_num?: number;

  allow_timezones?: boolean;
  allow_timezones_line_num?: number;
}
