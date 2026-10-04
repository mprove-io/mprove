import type { RelationshipType } from '#common/types/shared/schema/relationship-type';

export function getExpectedMirrorType(item: {
  type: RelationshipType;
}): RelationshipType {
  let { type } = item;
  if (type === 'one_to_many') {
    return 'many_to_one';
  }
  if (type === 'many_to_one') {
    return 'one_to_many';
  }
  return type;
}
