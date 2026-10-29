import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { rebuildBranchBridges } from '#backend/functions/blockml/rebuild-branch-bridges/rebuild-branch-bridges';
import { makeBranch } from '#backend/functions/db/branches/make-branch/make-branch';
import { makeBridge } from '#backend/functions/db/bridges/make-bridge/make-bridge';
import { makeMember } from '#backend/functions/db/members/make-member/make-member';
import { projectTabToBaseProject } from '#backend/functions/project-tab-to-base-project/project-tab-to-base-project';
import type { DbService } from '#backend/services/db/db.service';
import type { RpcService } from '#backend/services/rpc/rpc.service';
import type { TabService } from '#backend/services/tab/tab.service';
import {
  EMPTY_STRUCT_ID,
  PROD_REPO_ID,
  PROJECT_ENV_PROD
} from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { AddMemberToDemoProjectError } from '#common/types/backend/function-errors/add-member-to-demo-project-error';

export async function addMemberToDemoProject(item: {
  user: UserTab;
  traceId: string;
  cs: ConfigService<BackendConfig>;
  db: DbService;
  tabService: TabService;
  rpcService: RpcService;
  logger: Logger;
}): Result.ResultAsync<void, AddMemberToDemoProjectError> {
  return Result.pipe(
    Result.succeed({
      ...item,
      demoProjectId:
        item.cs.get<BackendConfig['demoProjectId']>('demoProjectId')
    }),
    Result.bind('project', async v =>
      isUndefined(v.demoProjectId)
        ? Result.succeed(undefined)
        : v.db.projects.findFirst({
            where: eq(projectsTable.projectId, v.demoProjectId)
          })
    ),
    Result.bind('member', async v =>
      isUndefined(v.project)
        ? Result.succeed(undefined)
        : v.db.members.findFirst({
            where: and(
              eq(membersTable.memberId, v.user.userId),
              eq(membersTable.projectId, v.demoProjectId)
            )
          })
    ),
    Result.bind('newMember', v =>
      Result.succeed(
        isUndefined(v.project) || isDefined(v.member)
          ? undefined
          : makeMember({
              projectId: v.demoProjectId,
              user: v.user,
              isAdmin: false,
              isEditor: true,
              isExplorer: true
            })
      )
    ),
    Result.bind('baseProject', v =>
      Result.succeed(
        isUndefined(v.newMember)
          ? undefined
          : projectTabToBaseProject({
              tabService: v.tabService,
              project: v.project
            })
      )
    ),
    Result.bind('diskCreateDevRepoOutput', async v =>
      isUndefined(v.newMember)
        ? Result.succeed(undefined)
        : v.rpcService.sendToDisk({
            request: {
              operation: 'createDevRepo',
              traceId: v.traceId,
              input: {
                baseProject: v.baseProject,
                devRepoId: v.newMember.memberId
              }
            }
          })
    ),
    Result.bind('prodBranch', async v =>
      isUndefined(v.newMember)
        ? Result.succeed(undefined)
        : v.db.branches.findFirst({
            where: and(
              eq(branchesTable.projectId, v.demoProjectId),
              eq(branchesTable.repoId, PROD_REPO_ID),
              eq(branchesTable.branchId, v.project.defaultBranch)
            )
          })
    ),
    Result.bind('devBranch', v =>
      Result.succeed(
        isUndefined(v.newMember)
          ? undefined
          : makeBranch({
              projectId: v.demoProjectId,
              repoId: v.newMember.memberId,
              branchId: v.project.defaultBranch
            })
      )
    ),
    Result.bind('prodBranchBridges', async v =>
      isUndefined(v.newMember)
        ? Result.succeed([])
        : v.db.bridges.findMany({
            where: and(
              eq(bridgesTable.projectId, v.prodBranch.projectId),
              eq(bridgesTable.repoId, v.prodBranch.repoId),
              eq(bridgesTable.branchId, v.prodBranch.branchId)
            )
          })
    ),
    Result.bind('devBranchBridges', v =>
      Result.succeed(
        v.prodBranchBridges.map(bridge =>
          makeBridge({
            projectId: v.devBranch.projectId,
            repoId: v.devBranch.repoId,
            branchId: v.devBranch.branchId,
            envId: bridge.envId,
            structId: EMPTY_STRUCT_ID,
            needValidate: true
          })
        )
      )
    ),
    Result.andThrough(v =>
      isUndefined(v.newMember)
        ? Result.succeed()
        : rebuildBranchBridges({
            branchBridges: v.devBranchBridges,
            envId: PROJECT_ENV_PROD,
            traceId: v.traceId,
            orgId: v.project.orgId,
            projectId: v.demoProjectId,
            repoId: v.user.userId,
            diskFiles: v.diskCreateDevRepoOutput.files,
            mproveDir: v.diskCreateDevRepoOutput.mproveDir,
            db: v.db,
            tabService: v.tabService,
            rpcService: v.rpcService,
            cs: v.cs,
            logger: v.logger
          })
    ),
    Result.andThrough(v =>
      isUndefined(v.newMember)
        ? Result.succeed()
        : v.db.write({
            insertOrUpdate: {
              members: [v.newMember],
              branches: [v.devBranch],
              bridges: [...v.devBranchBridges]
            }
          })
    ),
    Result.map((v): void => undefined)
  );
}
