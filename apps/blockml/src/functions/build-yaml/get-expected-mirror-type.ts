import { RelationshipTypeEnum } from '#common/enums/relationship-type.enum';

export function getExpectedMirrorType(item: {
  type: RelationshipTypeEnum;
}): RelationshipTypeEnum {
  let { type } = item;
  if (type === RelationshipTypeEnum.OneToMany) {
    return RelationshipTypeEnum.ManyToOne;
  }
  if (type === RelationshipTypeEnum.ManyToOne) {
    return RelationshipTypeEnum.OneToMany;
  }
  return type;
}
