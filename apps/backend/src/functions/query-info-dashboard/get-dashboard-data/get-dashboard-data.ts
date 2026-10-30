import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import type { BridgeTab } from '#backend/drizzle/postgres/tables/bridges';
import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import { modelsTable } from '#backend/drizzle/postgres/tables/models';
import type { ProjectTab } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { rebuildStruct } from '#backend/functions/blockml/rebuild-struct/rebuild-struct';
import { dashboardApiToTab } from '#backend/functions/db/dashboards/dashboard-api-to-tab/dashboard-api-to-tab';
import { getDashboardXCheckExistsAndAccess } from '#backend/functions/db/dashboards/get-dashboard-x-check-exists-and-access/get-dashboard-x-check-exists-and-access';
import { getDashboardXUsingDashboardTab } from '#backend/functions/db/dashboards/get-dashboard-x-using-dashboard-tab/get-dashboard-x-using-dashboard-tab';
import { processDashboard } from '#backend/functions/db/dashboards/process-dashboard/process-dashboard';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { getModelPartXs } from '#backend/functions/db/models/get-model-part-xs/get-model-part-xs';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { structTabToApi } from '#backend/functions/db/structs/struct-tab-to-api/struct-tab-to-api';
import { getUserSelectedGivens } from '#backend/functions/db/users/get-user-selected-givens/get-user-selected-givens';
import { makeDashboardFileText } from '#backend/functions/make-dashboard-file-text/make-dashboard-file-text';
import type { DbService } from '#backend/services/db/db.service';
import type { RpcService } from '#backend/services/rpc/rpc.service';
import type { TabService } from '#backend/services/tab/tab.service';
import {
  MPROVE_CONFIG_DIR_DOT_SLASH,
  MPROVE_USERS_FOLDER,
  UTC
} from '#common/constants/top';
import { DEFAULT_SRV_UI } from '#common/constants/top-backend';
import { encodeFilePath } from '#common/functions/encode-file-path/encode-file-path';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import type { GetDashboardDataError } from '#common/types/backend/function-errors/get-dashboard-data-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
import type { ToBackendGetDashboardOutput } from '#common/types/backend/routes/dashboards/get-dashboard/get-dashboard-output';
import type { FileExtension } from '#common/types/blockml/parts/file/file-extension';
import type { DiskCatalogFile } from '#common/types/disk/parts/catalog/disk-catalog-file';

type PrepareQueryDashboardFilePayload = {
  newDashboardId: string;
  fileName: string;
  mdir: string;
  relativePath: string;
  fileId: string;
  fileNodeId: string;
  pathString: string;
  dashboardFileText: string;
  tempFile: DiskCatalogFile;
  diskFiles: DiskCatalogFile[];
  modelIds: string[];
};

export async function getDashboardData(item: {
  traceId: string;
  user: UserTab;
  userMember: MemberTab;
  project: ProjectTab;
  bridge: BridgeTab;
  projectId: string;
  repoId: string;
  envId: string;
  dashboardId: string;
  timezone: string;
  skipUi: boolean;
  db: DbService;
  cs: ConfigService<BackendConfig>;
  tabService: TabService;
  rpcService: RpcService;
  logger: Logger;
}): Result.ResultAsync<ToBackendGetDashboardOutput, GetDashboardDataError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('apiUserMember', v =>
      Result.succeed(
        memberTabToApi({
          member: v.userMember
        })
      )
    ),
    Result.bind('currentStruct', v =>
      getStructCheckExists({
        structId: v.bridge.structId,
        projectId: v.projectId,
        cs: v.cs,
        db: v.db
      })
    ),
    Result.bind('fromDashboardX', v =>
      getDashboardXCheckExistsAndAccess({
        db: v.db,
        dashboardId: v.dashboardId,
        structId: v.bridge.structId,
        apiUserMember: v.apiUserMember,
        projectId: v.projectId,
        user: v.user
      })
    ),
    Result.bind('prepareQueryDashboardFilePayload', v => {
      let newDashboardId: string = v.fromDashboardX.dashboardId;

      let fileName: string = `${newDashboardId}${'.dashboard' satisfies FileExtension}`;

      let mdir: string = v.currentStruct.mproveConfig.mproveDirValue;

      if (
        mdir.length > 2 &&
        mdir.substring(0, 2) === MPROVE_CONFIG_DIR_DOT_SLASH
      ) {
        mdir = mdir.substring(2);
      }

      let relativePath: string =
        v.fromDashboardX.draft === true
          ? v.currentStruct.mproveConfig.mproveDirValue ===
            MPROVE_CONFIG_DIR_DOT_SLASH
            ? `${MPROVE_USERS_FOLDER}/${v.user.alias}/${fileName}`
            : `${mdir}/${MPROVE_USERS_FOLDER}/${v.user.alias}/${fileName}`
          : v.fromDashboardX.filePath.split('/').slice(1).join('/');

      let fileId: string = encodeFilePath({ filePath: relativePath });

      let fileNodeId: string = `${v.projectId}/${relativePath}`;

      let pathString: string = JSON.stringify(fileNodeId.split('/'));

      let dashboardFileText: string = makeDashboardFileText({
        dashboard: v.fromDashboardX,
        newDashboardId: newDashboardId,
        newTitle: v.fromDashboardX.title,
        roles: v.fromDashboardX.accessRoles,
        caseSensitiveStringFilters:
          v.currentStruct.mproveConfig.caseSensitiveStringFilters,
        timezone: UTC
      });

      let tempFile: DiskCatalogFile = {
        projectId: v.projectId,
        repoId: v.repoId,
        fileId: fileId,
        fileNodeId: fileNodeId,
        pathString: pathString,
        name: fileName,
        content: dashboardFileText
      };

      let diskFiles: DiskCatalogFile[] = [tempFile];

      let modelIds: string[] = [
        ...(v.fromDashboardX?.tiles ?? []).map(tile => tile.modelId),
        ...v.fromDashboardX.fields
          .filter(x => isDefined(x.storeModel))
          .map(x => x.storeModel)
      ];

      let prepareQueryDashboardFilePayload: PrepareQueryDashboardFilePayload = {
        newDashboardId: newDashboardId,
        fileName: fileName,
        mdir: mdir,
        relativePath: relativePath,
        fileId: fileId,
        fileNodeId: fileNodeId,
        pathString: pathString,
        dashboardFileText: dashboardFileText,
        tempFile: tempFile,
        diskFiles: diskFiles,
        modelIds: modelIds
      };

      return Result.succeed(prepareQueryDashboardFilePayload);
    }),
    Result.bind('cachedModels', v =>
      v.db.models.findMany({
        where: and(
          eq(modelsTable.structId, v.bridge.structId),
          inArray(
            modelsTable.modelId,
            v.prepareQueryDashboardFilePayload.modelIds
          )
        )
      })
    ),
    Result.bind('selectedGivens', v =>
      getUserSelectedGivens({
        user: v.user,
        projectId: v.projectId,
        db: v.db
      })
    ),
    Result.bind('rebuild', v =>
      rebuildStruct({
        traceId: v.traceId,
        orgId: v.project.orgId,
        projectId: v.projectId,
        repoId: v.repoId,
        structId: v.bridge.structId,
        diskFiles: v.prepareQueryDashboardFilePayload.diskFiles,
        mproveDir: v.currentStruct.mproveConfig.mproveDirValue,
        skipDb: true,
        envId: v.envId,
        selectedGivens: v.selectedGivens,
        overrideTimezone: v.timezone,
        isUseCache: true,
        cachedMproveConfig: v.currentStruct.mproveConfig,
        cachedModels: v.cachedModels,
        cachedMetrics: [],
        db: v.db,
        tabService: v.tabService,
        rpcService: v.rpcService,
        cs: v.cs,
        logger: v.logger
      })
    ),
    Result.bind('newApiDashboard', v =>
      Result.succeed(
        v.rebuild.dashboards.find(
          x =>
            x.dashboardId === v.prepareQueryDashboardFilePayload.newDashboardId
        )
      )
    ),
    Result.andThrough(v =>
      isUndefined(v.newApiDashboard)
        ? Result.fail({
            code: 'BACKEND_GET_DASHBOARD_FAIL',
            displayData: {
              structErrors: v.rebuild.struct.errors
            }
          })
        : Result.succeed()
    ),
    Result.andThrough(v => {
      v.newApiDashboard.draft = v.fromDashboardX.draft;

      v.newApiDashboard.creatorId = v.fromDashboardX.creatorId;

      return Result.succeed();
    }),
    Result.bind('processedDashboard', v =>
      processDashboard({
        newApiDashboard: v.newApiDashboard,
        apiMconfigs: v.rebuild.mconfigs,
        apiQueries: v.rebuild.queries,
        apiModels: v.rebuild.models,
        fromDashboardX: v.fromDashboardX,
        isQueryCache: false,
        cachedQueries: [],
        cachedMconfigs: [],
        envId: v.envId,
        newDashboardId: v.prepareQueryDashboardFilePayload.newDashboardId,
        tempStruct: v.rebuild.struct,
        project: v.project,
        db: v.db
      })
    ),
    Result.andThrough(async v => {
      let persistenceResult: Result.Result<void, WriteError> = await v.db.write(
        {
          insert: {
            mconfigs: v.processedDashboard.insertMconfigs
          },
          insertOrUpdate: {
            queries: v.processedDashboard.insertOrUpdateQueries
          },
          insertOrDoNothing: {
            queries: v.processedDashboard.insertOrDoNothingQueries
          }
        }
      );

      if (Result.isFailure(persistenceResult)) {
        return persistenceResult;
      }

      return Result.succeed();
    }),
    Result.bind('newDashboardX', v =>
      getDashboardXUsingDashboardTab({
        db: v.db,
        dashboard: dashboardApiToTab({
          apiDashboard: v.newApiDashboard
        }),
        projectId: v.projectId,
        structId: v.bridge.structId,
        apiUserMember: v.apiUserMember
      })
    ),
    Result.bind('struct', v =>
      getStructCheckExists({
        structId: v.bridge.structId,
        projectId: v.projectId,
        cs: v.cs,
        db: v.db
      })
    ),
    Result.bind('modelPartXs', v =>
      getModelPartXs({
        structId: v.struct.structId,
        apiUserMember: v.apiUserMember,
        db: v.db
      })
    ),
    Result.andThrough(async v => {
      if (v.skipUi === false) {
        v.user.ui = v.user.ui || makeCopy(DEFAULT_SRV_UI);

        v.user.ui.timezone = v.timezone;

        let persistenceResult: Result.Result<void, WriteError> =
          await v.db.write({
            insertOrUpdate: {
              users: [v.user]
            }
          });

        if (Result.isFailure(persistenceResult)) {
          return persistenceResult;
        }
      }

      return Result.succeed();
    }),
    Result.map(
      (v): ToBackendGetDashboardOutput => ({
        needValidate: v.bridge.needValidate,
        struct: structTabToApi({
          struct: v.struct,
          modelPartXs: v.modelPartXs
        }),
        userMember: v.apiUserMember,
        dashboard: v.newDashboardX
      })
    )
  );
}
