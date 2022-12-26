import test from 'ava';
import { common } from '~mcli/barrels/common';
import { constants } from '~mcli/barrels/constants';
import { interfaces } from '~mcli/barrels/interfaces';
import { getConfig } from '~mcli/config/get.config';
import { checkIsTrue } from '~mcli/functions/check-is-true';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { prepareTest } from '~mcli/functions/prepare-test';
import { CustomContext } from '~mcli/models/custom-command';
import { RunCommand } from '../run';
let retry = require('async-retry');

let testId = 'mcli__run__ok-concurrency-wait';

test('1', async t => {
  let code: number;
  let isPass: boolean;
  let parsedOutput: any;
  let context: CustomContext;

  let queriesStats: interfaces.QueriesStats;

  await retry(async (bail: any) => {
    let defaultBranch = common.BRANCH_MASTER;

    let projectId = common.makeId();

    let commandLine = `run \
--project-id ${projectId} \
--repo production \
--branch ${defaultBranch} \
--env prod \
--concurrency 2 \
--wait \
--sleep 2 \
--dashboard-ids ec1_d1 \
--viz-ids 4K9SNSMG0IQPQZ9CL23U,4V3KWMRA9MSH21EQZCJQ \
--get-dashboards \
--get-vizs \
--json`;

    let userId = common.makeId();
    let email = `${testId}@example.com`;
    let password = '123123';

    let orgId = 't' + testId;
    let orgName = testId;

    let projectName = testId;

    let config = getConfig();

    try {
      let { cli, mockContext } = await prepareTest({
        command: RunCommand,
        config: config,
        deletePack: {
          emails: [email],
          orgIds: [orgId],
          projectIds: [projectId],
          projectNames: [projectName]
        },
        seedPack: {
          users: [
            {
              userId,
              email: email,
              password: password,
              isEmailVerified: common.BoolEnum.TRUE
            }
          ],
          orgs: [
            {
              orgId: orgId,
              ownerEmail: email,
              name: orgName
            }
          ],
          projects: [
            {
              orgId,
              projectId,
              name: projectName,
              testProjectId: 'first-project',
              defaultBranch: defaultBranch,
              remoteType: common.ProjectRemoteTypeEnum.Managed,
              gitUrl: undefined,
              publicKey: undefined,
              privateKey: undefined
            }
          ],
          members: [
            {
              memberId: userId,
              email,
              projectId,
              isAdmin: common.BoolEnum.TRUE,
              isEditor: common.BoolEnum.TRUE,
              isExplorer: common.BoolEnum.TRUE
            }
          ],
          connections: [
            {
              projectId: projectId,
              connectionId: 'c1_postgres',
              envId: common.PROJECT_ENV_PROD,
              type: common.ConnectionTypeEnum.PostgreSQL,
              host: 'dwh-postgres',
              port: 5432,
              database: 'p_db',
              username: 'postgres',
              password: config.mproveCliTestDwhPostgresPassword
            }
          ]
        },
        loginEmail: email,
        loginPassword: password
      });

      context = mockContext as any;
      code = await cli.run(commandLine.split(' '), context);
    } catch (e) {
      logToConsoleMcli({
        log: e,
        logLevel: common.LogLevelEnum.Error,
        context: context,
        isJson: true
      });
    }

    try {
      parsedOutput = JSON.parse(context.stdout.toString());
    } catch (e) {
      logToConsoleMcli({
        log: e,
        logLevel: common.LogLevelEnum.Error,
        context: context,
        isJson: true
      });
    }

    queriesStats = parsedOutput?.queriesStats;

    isPass = checkIsTrue(
      code === 0 &&
        common.isDefined(queriesStats) &&
        queriesStats.started === 0 &&
        queriesStats.running === 0 &&
        queriesStats.completed === 15 &&
        queriesStats.error === 0 &&
        queriesStats.canceled === 0
    );
  }, constants.RETRY_OPTIONS).catch((er: any) => {
    logToConsoleMcli({
      log: er,
      logLevel: common.LogLevelEnum.Error,
      context: undefined,
      isJson: false
    });
  });

  if (isPass === false) {
    console.log(context.stdout.toString());
    console.log(context.stderr.toString());
  }

  t.is(code, 0);
  t.is(common.isDefined(queriesStats), true);
  t.is(queriesStats.started === 0, true);
  t.is(queriesStats.running === 0, true);
  t.is(queriesStats.completed === 15, true);
  t.is(queriesStats.error === 0, true);
  t.is(queriesStats.canceled === 0, true);
});
