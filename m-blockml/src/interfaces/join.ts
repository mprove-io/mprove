import { enums } from '../barrels/enums';
import { View } from './view';

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

  type: enums.JoinTypeEnum;
  type_line_num: number;

  sql_on: string;
  sql_on_line_num: number;

  sql_where: string;
  sql_where_line_num: number;

  //

  sqlOnReal: string;

  sqlWhereReal: string;

  view: View;

  sqlWhereDoubleDeps: {
    [field: string]: {
      [dep: string]: number;
    };
  };
}
