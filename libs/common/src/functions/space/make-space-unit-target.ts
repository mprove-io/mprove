import {
  MY_UNITS_SPACE_ID,
  MY_UNITS_TITLE,
  PERSONAL_UNITS_SPACE_ID,
  PERSONAL_UNITS_TITLE,
  SHARED_UNITS_SPACE_ID,
  SHARED_UNITS_TITLE,
  UNCATEGORIZED_UNITS_SPACE_ID,
  UNCATEGORIZED_UNITS_TITLE
} from '#common/constants/top';
import type { Member } from '#common/zod/backend/member';
import { isDefinedAndNotEmpty } from '../is-defined-and-not-empty';
import { isUndefined } from '../is-undefined';

export type SpaceUnitTarget = {
  space: string;
  rootSpace: string;
  rootTitle: string;
  displaySpace: string;
  childTitle?: string;
  isSynthetic: boolean;
};

export function makeSpaceUnitTarget(item: {
  space: string | undefined;
  author: string | undefined;
  accessRoles: string[];
  member: Member;
}): SpaceUnitTarget {
  let { space, author, accessRoles, member } = item;

  if (isDefinedAndNotEmpty(space)) {
    return {
      space: space,
      rootSpace: space,
      rootTitle: space,
      displaySpace: space,
      isSynthetic: false
    };
  }

  let isAdminOrEditor = member.isAdmin === true || member.isEditor === true;

  if (author === member.alias) {
    return {
      space: MY_UNITS_SPACE_ID,
      rootSpace: MY_UNITS_SPACE_ID,
      rootTitle: MY_UNITS_TITLE,
      displaySpace: MY_UNITS_TITLE,
      isSynthetic: true
    };
  }

  if (isUndefined(author)) {
    return {
      space: UNCATEGORIZED_UNITS_SPACE_ID,
      rootSpace: UNCATEGORIZED_UNITS_SPACE_ID,
      rootTitle: UNCATEGORIZED_UNITS_TITLE,
      displaySpace: UNCATEGORIZED_UNITS_TITLE,
      isSynthetic: true
    };
  }

  if (
    isAdminOrEditor === true &&
    author !== member.alias &&
    accessRoles.length === 0
  ) {
    return {
      space: `${PERSONAL_UNITS_SPACE_ID}/${author}`,
      rootSpace: PERSONAL_UNITS_SPACE_ID,
      rootTitle: PERSONAL_UNITS_TITLE,
      displaySpace: `${PERSONAL_UNITS_TITLE} - ${author}`,
      childTitle: author,
      isSynthetic: true
    };
  }

  if (author !== member.alias && accessRoles.length > 0) {
    return {
      space: `${SHARED_UNITS_SPACE_ID}/${author}`,
      rootSpace: SHARED_UNITS_SPACE_ID,
      rootTitle: SHARED_UNITS_TITLE,
      displaySpace: `${SHARED_UNITS_TITLE} - ${author}`,
      childTitle: author,
      isSynthetic: true
    };
  }

  return {
    space: UNCATEGORIZED_UNITS_SPACE_ID,
    rootSpace: UNCATEGORIZED_UNITS_SPACE_ID,
    rootTitle: UNCATEGORIZED_UNITS_TITLE,
    displaySpace: UNCATEGORIZED_UNITS_TITLE,
    isSynthetic: true
  };
}
