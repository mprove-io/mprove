import type { GivenType } from '#common/types/backend/parts/given/given-type';

export function isGivenTypeMalloyCompatible(item: {
  givenType: GivenType;
  isMultiple: boolean;
  malloyType: {
    type: string;
    elementTypeDef?: { type: string };
  };
}) {
  let { givenType, isMultiple, malloyType } = item;

  let expectedType: string;

  switch (givenType) {
    case 'String':
      expectedType = 'string';
      break;
    case 'Number':
      expectedType = 'number';
      break;
    case 'Boolean':
      expectedType = 'boolean';
      break;
    case 'Date':
      expectedType = 'date';
      break;
    case 'Timestamp':
      expectedType = 'timestamp';
      break;
    //
    // case 'TimestampTz':
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
