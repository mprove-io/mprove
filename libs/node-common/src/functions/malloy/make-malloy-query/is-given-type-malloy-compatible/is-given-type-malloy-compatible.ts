import { GivenTypeEnum } from '#common/enums/given-type.enum';

export function isGivenTypeMalloyCompatible(item: {
  givenType: GivenTypeEnum;
  isMultiple: boolean;
  malloyType: {
    type: string;
    elementTypeDef?: { type: string };
  };
}) {
  let { givenType, isMultiple, malloyType } = item;

  let expectedType: string;

  switch (givenType) {
    case GivenTypeEnum.String:
      expectedType = 'string';
      break;
    case GivenTypeEnum.Number:
      expectedType = 'number';
      break;
    case GivenTypeEnum.Boolean:
      expectedType = 'boolean';
      break;
    case GivenTypeEnum.Date:
      expectedType = 'date';
      break;
    case GivenTypeEnum.Timestamp:
      expectedType = 'timestamp';
      break;
    // case GivenTypeEnum.TimestampTz:
    //   expectedType = 'timestamptz';
    //   break;
  }

  if (isMultiple) {
    return (
      malloyType.type === 'array' &&
      malloyType.elementTypeDef?.type === expectedType
    );
  }

  return malloyType.type === expectedType;
}
