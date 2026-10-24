import type { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import type {
  MemberTab,
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { makeMember } from '#backend/functions/db/members/make-member/make-member';
import type { DbService } from '#backend/services/db/db.service';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';

export async function addDemoMemberToDemoProject(item: {
  user: UserTab;
  cs: ConfigService<BackendConfig>;
  db: DbService;
}): Promise<void> {
  let { user, cs, db } = item;

  let demoProjectId: string =
    cs.get<BackendConfig['demoProjectId']>('demoProjectId');

  if (isDefined(demoProjectId)) {
    let project: ProjectTab = await db.projects.findFirstUnwrap({
      where: eq(projectsTable.projectId, demoProjectId)
    });

    if (isDefined(project)) {
      let member: MemberTab = await db.members.findFirstUnwrap({
        where: and(
          eq(membersTable.memberId, user.userId),
          eq(membersTable.projectId, demoProjectId)
        )
      });

      if (isUndefined(member)) {
        let newMember: MemberTab = makeMember({
          projectId: demoProjectId,
          user: user,
          isAdmin: false,
          isEditor: false,
          isExplorer: true
        });

        await db.writeUnwrap({
          insertOrUpdate: {
            members: [newMember]
          }
        });
      }
    }
  }
}
