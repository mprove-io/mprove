import test from 'ava';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { prepareTest } from '~backend/functions/prepare-test';

let testId = 'backend-create-viz__ok';

let traceId = testId;

let userId = common.makeId();
let email = `${testId}@example.com`;
let password = '123';

let orgId = testId;
let orgName = testId;

let testProjectId = 't1';
let projectId = common.makeId();
let projectName = 'p1';

let vizId = common.makeId();

let prep: interfaces.Prep;

test('1', async t => {
  let resp: apiToBackend.ToBackendCreateVizResponse;

  try {
    prep = await prepareTest({
      traceId: traceId,
      deleteRecordsPayload: {
        emails: [email],
        orgIds: [orgId],
        projectIds: [projectId]
      },
      seedRecordsPayload: {
        users: [
          {
            userId,
            email,
            password,
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
            testProjectId,
            name: projectName
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
            connectionId: 'c1',
            type: common.ConnectionTypeEnum.PostgreSQL
          }
        ]
      },
      loginUserPayload: { email, password }
    });

    let req: apiToBackend.ToBackendCreateVizRequest = {
      info: {
        name: apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateViz,
        traceId: traceId
      },
      payload: {
        projectId: projectId,
        repoId: userId,
        branchId: common.BRANCH_MASTER,
        vizId: vizId,
        vizFileText: `viz: ${vizId}
group: Ecommerce
reports:
- title: Average sale price by category
  model: ec_m1
  select:
  - f.category
  - a.average_sale_price_int
  sorts: a.average_sale_price_int desc  
  type: table
  tile:
    tile_width: '4'
    tile_height: '500'
`
      }
    };

    resp = await helper.sendToBackend<apiToBackend.ToBackendCreateVizResponse>({
      httpServer: prep.httpServer,
      loginToken: prep.loginToken,
      req: req
    });

    await prep.app.close();
  } catch (e) {
    common.logToConsole(e);
  }

  t.is(resp.info.error, undefined);
  t.is(resp.info.status, common.ResponseInfoStatusEnum.Ok);
});
