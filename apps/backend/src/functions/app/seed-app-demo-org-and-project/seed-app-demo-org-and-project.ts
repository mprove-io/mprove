import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import fse from 'fs-extra';
import type { BackendConfig } from '#backend/config/backend-config';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { type OrgTab, orgsTable } from '#backend/drizzle/postgres/tables/orgs';
import {
  type ProjectTab,
  projectsTable
} from '#backend/drizzle/postgres/tables/projects';
import {
  type UserTab,
  usersTable
} from '#backend/drizzle/postgres/tables/users';
import { addAppDemoConnections } from '#backend/functions/app/add-app-demo-connections/add-app-demo-connections';
import { getDconfigHashSecretUnwrap } from '#backend/functions/db/dconfigs/get-dconfig-hash-secret-unwrap/get-dconfig-hash-secret-unwrap';
import { addDemoMemberToDemoProject } from '#backend/functions/db/members/add-demo-member-to-demo-project/add-demo-member-to-demo-project';
import { addOrgUnwrap } from '#backend/functions/db/orgs/add-org-unwrap/add-org-unwrap';
import { addProjectUnwrap } from '#backend/functions/db/projects/add-project-unwrap/add-project-unwrap';
import { addDemoUser } from '#backend/functions/db/users/add-demo-user/add-demo-user';
import { makeHashUnwrap } from '#backend/functions/hash/make-hash-unwrap/make-hash-unwrap';
import type { DbService } from '#backend/services/db/db.service';
import type { RpcService } from '#backend/services/rpc/rpc.service';
import type { TabService } from '#backend/services/tab/tab.service';
import {
  DEMO_ORG_NAME,
  RESTRICTED_USER_EMAIL,
  RESTRICTED_USER_PASSWORD
} from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeId } from '#common/functions/make-id/make-id';
import type { Ev } from '#common/types/backend/parts/ev';

export async function seedAppDemoOrgAndProject(item: {
  mproveAdminUser: UserTab;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
  db: DbService;
  rpcService: RpcService;
  tabService: TabService;
}): Promise<void> {
  let { mproveAdminUser, cs, logger, db, rpcService, tabService } = item;

  let demoOrgId: BackendConfig['demoOrgId'] =
    cs.get<BackendConfig['demoOrgId']>('demoOrgId');

  let demoProjectId: BackendConfig['demoProjectId'] =
    cs.get<BackendConfig['demoProjectId']>('demoProjectId');

  let demoProjectName: BackendConfig['demoProjectName'] =
    cs.get<BackendConfig['demoProjectName']>('demoProjectName');

  if (
    isDefined(mproveAdminUser) &&
    isDefinedAndNotEmpty(demoOrgId) &&
    isDefinedAndNotEmpty(demoProjectId)
  ) {
    let demoOrg: OrgTab = await db.orgs.findFirstUnwrap({
      where: eq(orgsTable.orgId, demoOrgId)
    });

    if (isUndefined(demoOrg)) {
      demoOrg = await addOrgUnwrap({
        ownerId: mproveAdminUser.userId,
        ownerEmail: mproveAdminUser.email,
        name: DEMO_ORG_NAME,
        traceId: makeId(),
        orgId: demoOrgId,
        rpcService: rpcService,
        db: db
      });
    }

    let connections: ConnectionTab[] = await addAppDemoConnections({
      cs: cs,
      db: db,
      demoProjectId: demoProjectId
    });

    let demoProject: ProjectTab = await db.projects.findFirstUnwrap({
      where: eq(projectsTable.projectId, demoProjectId)
    });

    if (isUndefined(demoProject)) {
      let demoProjectRemoteType: BackendConfig['demoProjectRemoteType'] =
        cs.get<BackendConfig['demoProjectRemoteType']>('demoProjectRemoteType');

      let demoProjectRemoteGitUrl: BackendConfig['demoProjectRemoteGitUrl'] =
        cs.get<BackendConfig['demoProjectRemoteGitUrl']>(
          'demoProjectRemoteGitUrl'
        );

      let demoProjectRemotePrivateKeyEncryptedPath: BackendConfig['demoProjectRemotePrivateKeyEncryptedPath'] =
        cs.get<BackendConfig['demoProjectRemotePrivateKeyEncryptedPath']>(
          'demoProjectRemotePrivateKeyEncryptedPath'
        );

      let demoProjectRemotePublicKeyPath: BackendConfig['demoProjectRemotePublicKeyPath'] =
        cs.get<BackendConfig['demoProjectRemotePublicKeyPath']>(
          'demoProjectRemotePublicKeyPath'
        );

      let demoProjectRemotePassPhrase: BackendConfig['demoProjectRemotePassPhrase'] =
        cs.get<BackendConfig['demoProjectRemotePassPhrase']>(
          'demoProjectRemotePassPhrase'
        );

      let privateKeyEncrypted: string;
      let publicKey: string;

      if (
        isDefinedAndNotEmpty(demoProjectRemotePrivateKeyEncryptedPath) &&
        isDefinedAndNotEmpty(demoProjectRemotePublicKeyPath)
      ) {
        privateKeyEncrypted = fse
          .readFileSync(demoProjectRemotePrivateKeyEncryptedPath)
          .toString();

        publicKey = fse.readFileSync(demoProjectRemotePublicKeyPath).toString();
      }

      let ev1: Ev = {
        evId: 'MPROVE_SNOWFLAKE_DATABASE',
        val: 's_db'
      };

      let demoProjectE2bApiKey: BackendConfig['demoProjectE2bApiKey'] = cs.get<
        BackendConfig['demoProjectE2bApiKey']
      >('demoProjectE2bApiKey');

      demoProject = await addProjectUnwrap({
        orgId: demoOrg.orgId,
        name: demoProjectName,
        user: mproveAdminUser,
        traceId: makeId(),
        projectId: demoProjectId,
        seedProjectId: 'demo-project',
        remoteType: demoProjectRemoteType,
        gitUrl: demoProjectRemoteGitUrl,
        publicKey: publicKey,
        publicKeyEncrypted: undefined,
        privateKey: undefined,
        privateKeyEncrypted: privateKeyEncrypted,
        passPhrase: demoProjectRemotePassPhrase,
        e2bApiKey: demoProjectE2bApiKey,
        evs: [ev1],
        connections: connections,
        tabService: tabService,
        rpcService: rpcService,
        db: db,
        cs: cs,
        logger: logger
      });
    }

    let hashSecret: string = await getDconfigHashSecretUnwrap({ db: db });

    let demoUserEmail = RESTRICTED_USER_EMAIL;
    let demoUserInitialPassword = RESTRICTED_USER_PASSWORD;

    let demoUserEmailHash: string = makeHashUnwrap({
      input: demoUserEmail,
      hashSecret: hashSecret
    });

    let demoUser: UserTab = await db.users.findFirstUnwrap({
      where: eq(usersTable.emailHash, demoUserEmailHash)
    });

    if (isUndefined(demoUser)) {
      demoUser = await addDemoUser({
        email: demoUserEmail,
        password: demoUserInitialPassword,
        db: db
      });

      await addDemoMemberToDemoProject({
        user: demoUser,
        cs: cs,
        db: db
      });
    }
  }
}
