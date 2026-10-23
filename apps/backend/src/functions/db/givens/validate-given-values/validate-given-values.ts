import { Result } from '@praha/byethrow';
import { getGivenValueValidationError } from '#common/functions/get-given-value-validation-error/get-given-value-validation-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ValidateGivenValuesError } from '#common/types/backend/function-errors/validate-given-values-error';
import type { GivenType } from '#common/types/backend/parts/given/given-type';

export function validateGivenValues(item: {
  type: GivenType;
  isMultiple: boolean;
  values: string[];
}): Result.Result<void, ValidateGivenValuesError> {
  let { type, isMultiple, values } = item;

  let error: string = getGivenValueValidationError({
    type: type,
    isMultiple: isMultiple,
    values: values
  });

  if (isDefined(error)) {
    return Result.fail({
      code: 'BACKEND_WRONG_GIVEN_VALUE',
      displayData: {
        error: error
      }
    });
  }

  return Result.succeed();
}
