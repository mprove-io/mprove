import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getMemberGivensForSelection } from '#backend/functions/db/givens/get-member-givens-for-selection/get-member-givens-for-selection';
import type { DbService } from '#backend/services/db/db.service';
import { DEFAULT_SRV_UI } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import type { DbMembersFindFirstError } from '#common/types/backend/function-errors/db/members/db-members-find-first-error';
import type { GetMemberGivensForSelectionError } from '#common/types/backend/function-errors/get-member-givens-for-selection-error';
import type { SelectUnselectedGivensError } from '#common/types/backend/function-errors/select-unselected-givens-error';
import type { SelectedGiven } from '#common/types/backend/parts/given/selected-given';
import type { MemberGiven } from '#common/types/backend/parts/members/member-given';
import type { ProjectSelectedGivenLink } from '#common/types/backend/parts/project-selected-given-link';

export async function selectUnselectedGivens(item: {
  user: UserTab;
  projectId: string;
  db: DbService;
}): Result.ResultAsync<
  ProjectSelectedGivenLink[],
  SelectUnselectedGivensError
> {
  let { user, projectId, db } = item;

  user.ui = user.ui ?? makeCopy(DEFAULT_SRV_UI);

  let existingLinks: ProjectSelectedGivenLink[] =
    user.ui.projectSelectedGivenLinks ?? [];

  let memberResult: Result.Result<MemberTab, DbMembersFindFirstError> =
    await db.members.findFirst({
      where: and(
        eq(membersTable.memberId, user.userId),
        eq(membersTable.projectId, projectId)
      )
    });

  if (Result.isFailure(memberResult)) {
    return memberResult;
  }

  let member: MemberTab = memberResult.value;

  if (isUndefined(member)) {
    return Result.succeed(user.ui.projectSelectedGivenLinks);
  }

  let memberGivensResult: Result.Result<
    MemberGiven[],
    GetMemberGivensForSelectionError
  > = await getMemberGivensForSelection({
    db: db,
    projectId: member.projectId,
    roles: member.roles
  });

  if (Result.isFailure(memberGivensResult)) {
    return memberGivensResult;
  }

  let memberGivens: MemberGiven[] = memberGivensResult.value;

  let existingLink: ProjectSelectedGivenLink = existingLinks.find(
    link => link.projectId === member.projectId
  );

  let selectedGivens: SelectedGiven[] = existingLink?.givens ?? [];

  let givens: SelectedGiven[] = memberGivens.map(given => {
    let storedGiven: SelectedGiven = selectedGivens.find(
      selectedGiven => selectedGiven.givenId === given.givenId
    );

    let availableValues: string[] = given.memberGivenValues.map(
      memberGivenValue => memberGivenValue.value
    );

    let values: string[];

    if (storedGiven === undefined) {
      values =
        given.isMultiple === true
          ? availableValues
          : availableValues.slice(0, 1);
    } else if (given.isMultiple !== true) {
      values = availableValues
        .filter(value => storedGiven.values.indexOf(value) > -1)
        .slice(0, 1);

      if (values.length === 0 && availableValues.length > 0) {
        values = availableValues.slice(0, 1);
      }
    } else {
      values = availableValues.filter(
        value => storedGiven.values.indexOf(value) > -1
      );
    }

    let normalizedGiven: SelectedGiven = {
      givenId: given.givenId,
      type: given.type,
      isMultiple: given.isMultiple,
      values: values
    };

    return normalizedGiven;
  });

  let projectSelectedGivenLink: ProjectSelectedGivenLink = {
    projectId: member.projectId,
    givens: givens,
    navTs: existingLink?.navTs ?? Date.now()
  };

  let isLinkExist: boolean = isDefined(existingLink);

  user.ui.projectSelectedGivenLinks = isLinkExist
    ? existingLinks.map(link =>
        link.projectId === projectId ? projectSelectedGivenLink : link
      )
    : [...existingLinks, projectSelectedGivenLink];

  return Result.succeed(user.ui.projectSelectedGivenLinks);
}
