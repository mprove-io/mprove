import { Calculation } from './calculation';
import { Dimension } from './dimension';
import { Filter } from './filter';
import { Measure } from './measure';
import { Time } from './time';

export interface FieldExt
  extends Dimension,
    Time,
    Measure,
    Calculation,
    Filter {}
