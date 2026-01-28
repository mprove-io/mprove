import test from 'ava';
import { BRANCH_MAIN, PROJECT_ENV_PROD } from '#common/constants/top';
import { RETRY_OPTIONS } from '#common/constants/top-mcli';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { makeId } from '#common/functions/make-id';
import { getConfig } from '~mcli/config/get.config';
import { logToConsoleMcli } from '~mcli/functions/log-to-console-mcli';
import { prepareTest } from '~mcli/functions/prepare-test';
import { CustomContext } from '~mcli/models/custom-command';
import { GetQueryCommand } from '../get-query';

let assert = require('node:assert/strict');
let retry = require('async-retry');

let testId = 'mcli__get-query__ok-report-row';

test('1', async t => {
  let code: number;
  let isPass: boolean;
  let parsedOutput: any;
  let context: CustomContext;

  await retry(async (bail: any) => {
    let defaultBranch = BRANCH_MAIN;

    let projectId = makeId();
    let reportId = '0ZN4W4XE9LQ7TSF5DQYC';
    let rowId = 'B';

    // pnpm mcli get-query \
    // --project-id DXYE72ODCP5LWPWH2EXQ \
    // --repo dev \
    // --branch main \
    // --env prod \
    // --report-id 0ZN4W4XE9LQ7TSF5DQYC \
    // --row-id B \
    // --detail days \
    // --range "f\`last 3 days\`" \
    // --timezone Asia/Yekaterinburg \
    // --get-sql \
    // --get-data

    let commandLine = `get-query \
--project-id ${projectId} \
--repo dev \
--branch ${defaultBranch} \
--env prod \
--report-id ${reportId} \
--row-id ${rowId} \
--detail days \
--timezone Asia/Yekaterinburg \
--get-sql \
--get-data \
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
        command: GetQueryCommand,
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
              privateKey: undefined,
              publicKeyEncrypted: undefined,
              privateKeyEncrypted: undefined,
              passPhrase: undefined
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
                  username: config.mproveCliTestDwhPostgresUser,
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

    assert.equal(code === 0, true, `code === 0`);
    assert.equal(
      isDefined(parsedOutput?.report),
      true,
      `isDefined(parsedOutput?.report)`
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
