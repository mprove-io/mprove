import { GivenTypeEnum } from '#common/enums/given-type.enum';

export function getGivenValueValidationError(item: {
  type: GivenTypeEnum;
  isMultiple: boolean;
  values: string[];
}) {
  let { type, isMultiple, values } = item;

  if (!isMultiple && values.length === 0) {
    return 'Non-empty value required for single-value given types';
  }

  if (!isMultiple && values.length > 1) {
    return 'Single-value given types accept only one value';
  }

  let invalidValue = values.find(value => {
    switch (type) {
      case GivenTypeEnum.String:
        return false;
      case GivenTypeEnum.Number:
        return !/^-?(\d+(\.\d+)?|\.\d+)([eE][+-]?\d+)?$/.test(value);
      case GivenTypeEnum.Boolean:
        return value !== 'true' && value !== 'false';
      case GivenTypeEnum.Date: {
        let date = new Date(`${value}T00:00:00.000Z`);

        return (
          !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
          date.toISOString().slice(0, 10) !== value
        );
      }
      case GivenTypeEnum.Timestamp: {
        let hasTimezoneOffset = /Z$|[+-]\d{2}:?\d{2}$/.test(value);
        if (hasTimezoneOffset) {
          return true;
        }

        let timestampValue = value.replace('T', ' ');
        let matches = timestampValue.match(
          /^(\d{4}-\d{2}-\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d+)?$/
        );

        if (matches === null) {
          return true;
        }

        let parsedMs = Date.parse(
          `${matches[1]}T${matches[2]}:${matches[3]}:${matches[4]}Z`
        );

        let isParsedMsInvalid = Number.isNaN(parsedMs);
        if (isParsedMsInvalid) {
          return true;
        }

        let parsedDate = new Date(parsedMs);

        return (
          parsedDate.toISOString().slice(0, 19) !==
          `${matches[1]}T${matches[2]}:${matches[3]}:${matches[4]}`
        );
      }
    }
  });

  if (invalidValue === undefined) {
    return undefined;
  }

  switch (type) {
    case GivenTypeEnum.String:
      return undefined;
    case GivenTypeEnum.Number:
      return `Expected numeric value, got '${invalidValue}'`;
    case GivenTypeEnum.Boolean:
      return `Expected 'true' or 'false', got '${invalidValue}'`;
    case GivenTypeEnum.Date:
      return `Expected date as YYYY-MM-DD, got '${invalidValue}'`;
    case GivenTypeEnum.Timestamp:
      return `Expected timestamp YYYY-MM-DD HH:MM:SS, got '${invalidValue}'`;
  }
}
