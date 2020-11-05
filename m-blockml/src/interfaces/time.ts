import { enums } from '../barrels/enums';
import { Field } from './field';

export interface Time extends Field {
  groupLabel: string;
  groupLabelLineNum: number;

  groupDescription: string;
  groupDescriptionLineNum: number;

  source: enums.TimeSourceEnum;
  sourceLineNum: number;

  unnest: string;
  unnestLineNum: number;

  timeframes: enums.TimeframeEnum[];
  timeframesLineNum: number;
}
