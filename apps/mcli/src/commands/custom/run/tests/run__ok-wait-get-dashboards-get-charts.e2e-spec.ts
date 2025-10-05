import test from 'ava';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '~common/constants/top';
import { RETRY_OPTIONS } from '~common/constants/top-mcli';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { LogLevelEnum } from '~common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { makeId } from '~common/functions/make-id';
import { McliQueriesStats } from '~common/interfaces/mcli/mcli-queries-stats';
import { getConfig } from '~mcli/config/get.config';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { prepareTest } from '~mcli/functions/prepare-test';
import { CustomContext } from '~mcli/models/custom-command';
import { RunCommand } from '../run';

let assert = require('node:assert/strict');
let retry = require('async-retry');

let testId = 'mcli__run__ok-wait-get-dashboards-get-charts';

test('1', async t => {
  let code: number;
  let isPass: boolean;
  let parsedOutput: any;
  let context: CustomContext;

  let queriesStats: McliQueriesStats;

  await retry(async (bail: any) => {
    let defaultBranch = BRANCH_MAIN;

    let projectId = makeId();
    let dashboardIds = 'c1_d1,c1_d2';
    let chartIds = '4V3KWMRA9MSH21EQZCJQ,829VI8FEJ6B5MIF78SWC';

    let commandLine = `run \
--project-id ${projectId} \
--repo production \
--branch ${defaultBranch} \
--env prod \
--wait \
--sleep 2 \
--dashboard-ids ${dashboardIds} \
--chart-ids ${chartIds} \
--get-dashboards \
--get-charts \
--json`;

    let userId = makeId();
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
              isEmailVerified: true
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
              testProjectId: 't5-mcli',
              defaultBranch: defaultBranch,
              remoteType: ProjectRemoteTypeEnum.Managed,
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
              isAdmin: true,
              isEditor: true,
              isExplorer: true
            }
          ],
          connections: [
            {
              projectId: projectId,
              connectionId: 'c1_postgres',
              envId: PROJECT_ENV_PROD,
              type: ConnectionTypeEnum.PostgreSQL,
              options: {
                postgres: {
                  host: 'dwh-postgres',
                  port: 5436,
                  database: 'p_db',
                  username: 'postgres',
                  password: config.mproveCliTestDwhPostgresPassword,
                  isSSL: false
                }
              }
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
        logLevel: LogLevelEnum.Error,
        context: context,
        isJson: true
      });
    }

    try {
      parsedOutput = JSON.parse(context.stdout.toString());
    } catch (e) {
      logToConsoleMcli({
        log: e,
        logLevel: LogLevelEnum.Error,
        context: context,
        isJson: true
      });
    }

    queriesStats = parsedOutput?.queriesStats;

    assert.equal(code === 0, true, `code === 0`);
    assert.equal(
      isDefined(parsedOutput.dashboards),
      true,
      `isDefined(parsedOutput.dashboards)`
    );
    assert.equal(
      isDefined(parsedOutput.charts),
      true,
      `isDefined(parsedOutput.charts)`
    );
    assert.equal(isDefined(queriesStats), true, `isDefined(queriesStats)`);
    assert.equal(
      queriesStats.started === 0,
      true,
      `queriesStats.started === 0`
    );
    assert.equal(
      queriesStats.running === 0,
      true,
      `queriesStats.running === 0`
    );
    assert.equal(
      queriesStats.completed === 18,
      true,
      `queriesStats.completed === 18`
    );
    assert.equal(queriesStats.error === 0, true, `queriesStats.error === 0`);
    assert.equal(
      queriesStats.canceled === 0,
      true,
      `queriesStats.canceled === 0`
    );

    isPass = true;
  }, RETRY_OPTIONS).catch((er: any) => {
    console.log(context.stdout.toString());
    console.log(context.stderr.toString());

    logToConsoleMcli({
      log: er,
      logLevel: LogLevelEnum.Error,
      context: undefined,
      isJson: false
    });
  });

  t.is(isPass, true);
});
