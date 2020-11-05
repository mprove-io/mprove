import { enums } from '../barrels/enums';
import { View } from './view';

export interface Join {
  fromView: string;
  fromViewLineNum: number;

  hidden: string; // boolean
  hiddenLineNum: number;

  label: string;
  labelLineNum: number;

  description: string;
  descriptionLineNum: number;

  as: string;
  asLineNum: number;

  joinView: string;
  joinViewLineNum: number;

  type: enums.JoinTypeEnum;
  typeLineNum: number;

  sqlOn: string;
  sqlOnLineNum: number;
  sqlOnReal: string;

  sqlWhere: string;
  sqlWhereLineNum: number;
  sqlWhereReal: string;

  view: View;

  sqlWhereDoubleDeps: {
    [field: string]: {
      [dep: string]: number;
    };
  };
}
