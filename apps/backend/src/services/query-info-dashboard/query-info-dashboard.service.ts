import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type {
  BridgeTab,
  MemberTab,
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { makeDashboardFileText } from '#backend/functions/make-dashboard-file-text/make-dashboard-file-text';
import { BlockmlService } from '#backend/services/blockml/blockml.service';
import { DashboardsService } from '#backend/services/db/dashboards/dashboards.service';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { UsersService } from '#backend/services/db/users/users.service';
import type { WriteOutput } from '#backend/services/db/write-output';
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

@Injectable()
export class QueryInfoDashboardService {
  constructor(
    private usersService: UsersService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private blockmlService: BlockmlService,
    private structsService: StructsService,
    private dashboardsService: DashboardsService,
    private db: DbService
  ) {}

  async getDashboardData(item: {
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
  }): Result.ResultAsync<ToBackendGetDashboardOutput, GetDashboardDataError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('apiUserMember', v =>
        Result.succeed(this.membersService.tabToApi({ member: v.userMember }))
      ),
      Result.bind('currentStruct', v =>
        this.structsService.getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId
        })
      ),
      Result.bind('fromDashboardX', v =>
        this.dashboardsService.getDashboardXCheckExistsAndAccess({
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

        let prepareQueryDashboardFilePayload: PrepareQueryDashboardFilePayload =
          {
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
        this.db.models.findMany({
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
        this.usersService.getSelectedGivens({
          user: v.user,
          projectId: v.projectId
        })
      ),
      Result.bind('rebuild', v =>
        this.blockmlService.rebuildStruct({
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
          cachedMetrics: []
        })
      ),
      Result.bind('newApiDashboard', v =>
        Result.succeed(
          v.rebuild.dashboards.find(
            x =>
              x.dashboardId ===
              v.prepareQueryDashboardFilePayload.newDashboardId
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
        this.dashboardsService.processDashboard({
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
          project: v.project
        })
      ),
      Result.andThrough(async v => {
        let persistenceResult: Result.Result<WriteOutput, WriteError> =
          await this.db.write({
            insert: {
              mconfigs: v.processedDashboard.insertMconfigs
            },
            insertOrUpdate: {
              queries: v.processedDashboard.insertOrUpdateQueries
            },
            insertOrDoNothing: {
              queries: v.processedDashboard.insertOrDoNothingQueries
            }
          });

        if (Result.isFailure(persistenceResult)) {
          return persistenceResult;
        }

        return Result.succeed();
      }),
      Result.bind('newDashboardX', v =>
        this.dashboardsService.getDashboardXUsingDashboardTab({
          dashboard: this.dashboardsService.apiToTab({
            apiDashboard: v.newApiDashboard
          }),
          projectId: v.projectId,
          structId: v.bridge.structId,
          apiUserMember: v.apiUserMember
        })
      ),
      Result.bind('struct', v =>
        this.structsService.getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId
        })
      ),
      Result.bind('modelPartXs', v =>
        this.modelsService.getModelPartXs({
          structId: v.struct.structId,
          apiUserMember: v.apiUserMember
        })
      ),
      Result.andThrough(async v => {
        if (v.skipUi === false) {
          v.user.ui = v.user.ui || makeCopy(DEFAULT_SRV_UI);

          v.user.ui.timezone = v.timezone;

          let persistenceResult: Result.Result<WriteOutput, WriteError> =
            await this.db.write({
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
          struct: this.structsService.tabToApi({
            struct: v.struct,
            modelPartXs: v.modelPartXs
          }),
          userMember: v.apiUserMember,
          dashboard: v.newDashboardX
        })
      )
    );
  }
}
