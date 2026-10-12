import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BridgeTab,
  MemberTab,
  ModelTab,
  ProjectTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { makeDashboardFileText } from '#backend/functions/make-dashboard-file-text/make-dashboard-file-text';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import type { RebuildStructOutput } from '#backend/services/blockml/blockml.service';
import { BlockmlService } from '#backend/services/blockml/blockml.service';
import {
  DashboardsService,
  type ProcessDashboardOutput
} from '#backend/services/db/dashboards/dashboards.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { UsersService } from '#backend/services/db/users/users.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
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
import type { DbErrorToError } from '#common/types/backend/function-errors/db-error-to-error';
import type { GetDashboardDataError } from '#common/types/backend/function-errors/get-dashboard-data-error';
import type { GetDashboardXCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-dashboard-x-check-exists-and-access-error';
import type { GetDashboardXUsingDashboardTabError } from '#common/types/backend/function-errors/get-dashboard-x-using-dashboard-tab-error';
import type { GetModelPartXsError } from '#common/types/backend/function-errors/get-model-part-xs-error';
import type { GetSelectedGivensError } from '#common/types/backend/function-errors/get-selected-givens-error';
import type { GetStructCheckExistsError } from '#common/types/backend/function-errors/get-struct-check-exists-error';
import type { ModelEntToTabError } from '#common/types/backend/function-errors/model-ent-to-tab-error';
import type { ProcessDashboardError } from '#common/types/backend/function-errors/process-dashboard-error';
import type { RebuildStructError } from '#common/types/backend/function-errors/rebuild-struct-error';
import type { DashboardX } from '#common/types/backend/parts/dashboard/dashboard-x';
import type { SelectedGiven } from '#common/types/backend/parts/given/selected-given';
import type { Member } from '#common/types/backend/parts/member';
import type { ModelPartX } from '#common/types/backend/parts/model/model-part-x';
import type { ToBackendGetDashboardOutput } from '#common/types/backend/routes/dashboards/get-dashboard/get-dashboard-output';
import type { Dashboard } from '#common/types/blockml/parts/dashboard/dashboard';
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
    private tabService: TabService,
    private usersService: UsersService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private blockmlService: BlockmlService,
    private structsService: StructsService,
    private dashboardsService: DashboardsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
  }): Promise<ToBackendGetDashboardOutput> {
    let {
      traceId,
      user,
      userMember,
      project,
      bridge,
      projectId,
      repoId,
      envId,
      dashboardId,
      timezone,
      skipUi
    } = item;

    let result: Result.Result<
      ToBackendGetDashboardOutput,
      GetDashboardDataError
    > = await this.getDashboardDataResult({
      traceId: traceId,
      user: user,
      userMember: userMember,
      project: project,
      bridge: bridge,
      projectId: projectId,
      repoId: repoId,
      envId: envId,
      dashboardId: dashboardId,
      timezone: timezone,
      skipUi: skipUi
    });

    if (Result.isFailure(result)) {
      throw new ServerError({
        message: result.error.code,
        displayData:
          'displayData' in result.error ? result.error.displayData : undefined,
        customData: 'info' in result.error ? result.error.info : undefined,
        originalError:
          'originalError' in result.error && result.error.originalError
            ? Object.assign(new Error(result.error.originalError.code), {
                displayData:
                  'displayData' in result.error.originalError
                    ? result.error.originalError.displayData
                    : undefined
              })
            : undefined
      });
    }

    let output: ToBackendGetDashboardOutput = result.value;

    return output;
  }

  async getDashboardDataResult(item: {
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
      Result.bind(
        'apiUserMember',
        (v): Result.Result<Member, never> =>
          Result.succeed(this.membersService.tabToApi({ member: v.userMember }))
      ),
      Result.bind(
        'currentStruct',
        (v): Result.ResultAsync<StructTab, GetStructCheckExistsError> =>
          this.structsService.getStructCheckExistsResult({
            structId: v.bridge.structId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'fromDashboardX',
        (
          v
        ): Result.ResultAsync<
          DashboardX,
          GetDashboardXCheckExistsAndAccessError
        > =>
          this.dashboardsService.getDashboardXCheckExistsAndAccessResult({
            dashboardId: v.dashboardId,
            structId: v.bridge.structId,
            apiUserMember: v.apiUserMember,
            projectId: v.projectId,
            user: v.user
          })
      ),
      Result.bind(
        'prepareQueryDashboardFilePayload',
        (v): Result.Result<PrepareQueryDashboardFilePayload, never> => {
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

          return Result.succeed({
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
          });
        }
      ),
      Result.bind(
        'cachedModels',
        (v): Result.ResultAsync<ModelTab[], ModelEntToTabError> =>
          this.db.drizzle.query.modelsTable
            .findMany({
              where: and(
                eq(modelsTable.structId, v.bridge.structId),
                inArray(
                  modelsTable.modelId,
                  v.prepareQueryDashboardFilePayload.modelIds
                )
              )
            })
            .then(xs =>
              Result.sequence(xs, x =>
                isUndefined(x)
                  ? Result.succeed(undefined)
                  : this.tabService.modelEntToTabResult({
                      modelEnt: x
                    })
              )
            )
      ),
      Result.bind(
        'selectedGivens',
        (v): Result.ResultAsync<SelectedGiven[], GetSelectedGivensError> =>
          this.usersService.getSelectedGivensResult({
            user: v.user,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'rebuild',
        (v): Result.ResultAsync<RebuildStructOutput, RebuildStructError> =>
          this.blockmlService.rebuildStructResult({
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
      Result.bind(
        'newApiDashboard',
        (v): Result.Result<Dashboard, never> =>
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

        return Result.succeed({});
      }),
      Result.bind(
        'processedDashboard',
        (
          v
        ): Result.ResultAsync<ProcessDashboardOutput, ProcessDashboardError> =>
          this.dashboardsService.processDashboardResult({
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
        let persistenceResult: Result.Result<void, DbErrorToError> =
          await dbErrorToResult({
            action: async () => {
              await retry(
                async () =>
                  await this.db.drizzle.transaction(
                    async tx =>
                      await this.db.packer.write({
                        tx: tx,
                        insert: {
                          mconfigs: v.processedDashboard.insertMconfigs
                        },
                        insertOrUpdate: {
                          queries: v.processedDashboard.insertOrUpdateQueries
                        },
                        insertOrDoNothing: {
                          queries: v.processedDashboard.insertOrDoNothingQueries
                        }
                      })
                  ),
                getRetryOption(this.cs, this.logger)
              );
            }
          });

        if (Result.isFailure(persistenceResult)) {
          return persistenceResult;
        }

        return Result.succeed();
      }),
      Result.bind(
        'newDashboardX',
        (
          v
        ): Result.ResultAsync<
          DashboardX,
          GetDashboardXUsingDashboardTabError
        > =>
          this.dashboardsService.getDashboardXUsingDashboardTabResult({
            dashboard: this.dashboardsService.apiToTab({
              apiDashboard: v.newApiDashboard
            }),
            projectId: v.projectId,
            structId: v.bridge.structId,
            apiUserMember: v.apiUserMember
          })
      ),
      Result.bind(
        'struct',
        (v): Result.ResultAsync<StructTab, GetStructCheckExistsError> =>
          this.structsService.getStructCheckExistsResult({
            structId: v.bridge.structId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'modelPartXs',
        (v): Result.ResultAsync<ModelPartX[], GetModelPartXsError> =>
          this.modelsService.getModelPartXsResult({
            structId: v.struct.structId,
            apiUserMember: v.apiUserMember
          })
      ),
      Result.andThrough(async v => {
        if (v.skipUi === false) {
          v.user.ui = v.user.ui || makeCopy(DEFAULT_SRV_UI);

          v.user.ui.timezone = v.timezone;

          let persistenceResult: Result.Result<void, DbErrorToError> =
            await dbErrorToResult({
              action: async () => {
                await retry(
                  async () =>
                    await this.db.drizzle.transaction(
                      async tx =>
                        await this.db.packer.write({
                          tx: tx,
                          insertOrUpdate: {
                            users: [v.user]
                          }
                        })
                    ),
                  getRetryOption(this.cs, this.logger)
                );
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
