import { common } from '~blockml/barrels/common';
import { View } from './file-types/view';

export interface Join {
  from_view: string;
  from_view_line_num: number;

  hidden: string; // boolean
  hidden_line_num: number;

  label: string;
  label_line_num: number;

  description: string;
  description_line_num: number;

  as: string;
  as_line_num: number;

  join_view: string;
  join_view_line_num: number;

  type: common.JoinTypeEnum;
  type_line_num: number;

  sql_on: string;
  sql_on_line_num: number;

  sql_where: string;
  sql_where_line_num: number;

  hide_fields?: string[];
  hide_fields_line_num?: number;

  show_fields?: string[];
  show_fields_line_num?: number;

  //

  view: View;

  sqlOnReal: string;

  sqlWhereReal: string;

  sqlOnDoubleDeps: {
    [as: string]: {
      [dep: string]: number;
    };
  };

  sqlWhereDoubleDeps: {
    [as: string]: {
      [dep: string]: number;
    };
  };
}
