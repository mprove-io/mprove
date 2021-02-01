import { Calculation } from '~blockml/interfaces/field-types/calculation';
import { Dimension } from '~blockml/interfaces/field-types/dimension';
import { Filter } from '~blockml/interfaces/field-types/filter';
import { Measure } from '~blockml/interfaces/field-types/measure';
import { Time } from '~blockml/interfaces/field-types/time';

export interface FieldAny
  extends Dimension,
    Time,
    Measure,
    Calculation,
    Filter {}
