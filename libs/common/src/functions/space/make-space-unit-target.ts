import {
  MY_SPACE_ID,
  PERSONAL_SPACE_ID,
  PERSONAL_SPACE_TITLE,
  SHARED_SPACE_ID,
  SHARED_SPACE_TITLE,
  UNCATEGORIZED_SPACE_ID,
  UNCATEGORIZED_SPACE_TITLE
} from '#common/constants/top';
import type { Member } from '#common/zod/backend/member';
import { isDefinedAndNotEmpty } from '../is-defined-and-not-empty';
import { isUndefined } from '../is-undefined';

export type SpaceUnitTarget = {
  space: string;
  rootSpace: string;
  rootTitle: string;
  spaceFullTitle: string;
  childTitle?: string;
  isSynthetic: boolean;
};

export function makeSpaceUnitTarget(item: {
  space: string | undefined;
  author: string | undefined;
  accessRoles: string[];
  member: Member;
  mySpaceTitle: string;
}): SpaceUnitTarget {
  let { space, author, accessRoles, member, mySpaceTitle } = item;

  if (isDefinedAndNotEmpty(space)) {
    return {
      space: space,
      rootSpace: space,
      rootTitle: space,
      spaceFullTitle: space,
      isSynthetic: false
    };
  }

  let isAdminOrEditor = member.isAdmin === true || member.isEditor === true;

  if (author === member.alias) {
    return {
      space: MY_SPACE_ID,
      rootSpace: MY_SPACE_ID,
      rootTitle: mySpaceTitle,
      spaceFullTitle: mySpaceTitle,
      isSynthetic: true
    };
  }

  if (isUndefined(author)) {
    return {
      space: UNCATEGORIZED_SPACE_ID,
      rootSpace: UNCATEGORIZED_SPACE_ID,
      rootTitle: UNCATEGORIZED_SPACE_TITLE,
      spaceFullTitle: UNCATEGORIZED_SPACE_TITLE,
      isSynthetic: true
    };
  }

  if (
    isAdminOrEditor === true &&
    author !== member.alias &&
    accessRoles.length === 0
  ) {
    return {
      space: `${PERSONAL_SPACE_ID}/${author}`,
      rootSpace: PERSONAL_SPACE_ID,
      rootTitle: PERSONAL_SPACE_TITLE,
      spaceFullTitle: `${PERSONAL_SPACE_TITLE} - ${author}`,
      childTitle: author,
      isSynthetic: true
    };
  }

  if (author !== member.alias && accessRoles.length > 0) {
    return {
      space: `${SHARED_SPACE_ID}/${author}`,
      rootSpace: SHARED_SPACE_ID,
      rootTitle: SHARED_SPACE_TITLE,
      spaceFullTitle: `${SHARED_SPACE_TITLE} - ${author}`,
      childTitle: author,
      isSynthetic: true
    };
  }

  return {
    space: UNCATEGORIZED_SPACE_ID,
    rootSpace: UNCATEGORIZED_SPACE_ID,
    rootTitle: UNCATEGORIZED_SPACE_TITLE,
    spaceFullTitle: UNCATEGORIZED_SPACE_TITLE,
    isSynthetic: true
  };
}
