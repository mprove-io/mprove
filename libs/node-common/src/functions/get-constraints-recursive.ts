import { ValidationError } from 'class-validator';
import { common } from '~node-common/barrels/common';

export function getConstraintsRecursive(
  nestedValidationErrors: ValidationError[]
) {
  return nestedValidationErrors.reduce(
    (allConstraints, nestedObject: ValidationError): any[] => {
      if (common.isDefined(nestedObject.constraints)) {
        allConstraints.push(nestedObject.constraints);
      }

      if (nestedObject.children) {
        allConstraints = [
          ...allConstraints,
          ...getConstraintsRecursive(nestedObject.children)
        ];
      }

      return allConstraints;
    },
    []
  );
}
