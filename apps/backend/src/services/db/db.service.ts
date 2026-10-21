import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { Options } from 'async-retry';
import type { SQLWrapper } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import { type DbExtra, DRIZZLE } from '#backend/drizzle/drizzle.module';
import {
  DrizzlePacker,
  type PackerOutput
} from '#backend/drizzle/postgres/drizzle-packer';
import type { ProjectTab } from '#backend/drizzle/postgres/schema/_tabs';
import { customRetry } from '#backend/functions/custom-retry/custom-retry';
import {
  type GetEntPropsOutput,
  getEntProps
} from '#backend/functions/get-ent-props/get-ent-props';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import type { DbTabsPack } from '#backend/interfaces/db-tabs-pack';
import { DbTableFactoryService } from '#backend/services/db/db-table-factory.service';
import { DbTableRegistry } from '#backend/services/db/db-table-registry';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
import type { BaseProject } from '#common/types/backend/parts/project/base-project';
import type { ProjectLt } from '#common/types/shared/st-lt/projects/project-lt';
import type { ProjectSt } from '#common/types/shared/st-lt/projects/project-st';

@Injectable()
export class DbService extends DbTableRegistry implements DbExtra {
  readonly packer: DrizzlePacker;

  constructor(
    @Inject(DRIZZLE) private dbExtra: DbExtra,
    private tableFactory: DbTableFactoryService,
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {
    super({
      dbExtra: dbExtra,
      tableFactory: tableFactory
    });

    this.packer = new DrizzlePacker({ tableRegistry: this });
  }

  get drizzle(): DbExtra['drizzle'] {
    return this.dbExtra.drizzle;
  }

  get pool(): DbExtra['pool'] {
    return this.dbExtra.pool;
  }

  getEntProps<DataSt, DataLt>(item: {
    dataSt: DataSt;
    dataLt: DataLt;
    isMetadata: boolean;
  }): GetEntPropsOutput<DataSt, DataLt> {
    let { dataSt, dataLt, isMetadata } = item;

    let output: GetEntPropsOutput<DataSt, DataLt> = getEntProps({
      dataSt: dataSt,
      dataLt: dataLt,
      isMetadata: isMetadata,
      tabService: this.tabService,
      isEncryptDb: this.tableFactory.isEncryptDb,
      isEncryptMetadata: this.tableFactory.isEncryptMetadata
    });

    return output;
  }

  projectTabToBaseProject(item: { project: ProjectTab }): BaseProject {
    let { project } = item;

    let projectSt: ProjectSt = {
      name: project.name,
      e2bApiKey: undefined // baseProject does not need project.e2bApiKey
    };

    let projectLt: ProjectLt = {
      defaultBranch: project.defaultBranch,
      gitUrl: project.gitUrl,
      publicKey: project.publicKey,
      privateKey: project.privateKey,
      publicKeyEncrypted: project.publicKey,
      privateKeyEncrypted: project.privateKeyEncrypted,
      passPhrase: project.passPhrase
    };

    let baseProject: BaseProject = {
      orgId: project.orgId,
      projectId: project.projectId,
      remoteType: project.remoteType,
      st: this.tabService.encrypt({ data: projectSt }),
      lt: this.tabService.encrypt({ data: projectLt })
    };

    return baseProject;
  }

  async writeUnwrap(item: {
    insert?: DbTabsPack;
    update?: DbTabsPack;
    insertOrUpdate?: DbTabsPack;
    insertOrDoNothing?: DbTabsPack;
    rawQueries?: SQLWrapper[];
    serverTs?: number;
    retryOptions?: Options;
  }): Promise<PackerOutput> {
    let {
      insert,
      update,
      insertOrUpdate,
      insertOrDoNothing,
      rawQueries,
      serverTs,
      retryOptions
    } = item;

    let result: Result.Result<PackerOutput, WriteError> = await this.write({
      insert: insert,
      update: update,
      insertOrUpdate: insertOrUpdate,
      insertOrDoNothing: insertOrDoNothing,
      rawQueries: rawQueries,
      serverTs: serverTs,
      retryOptions: retryOptions
    });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let output: PackerOutput = result.value;

    return output;
  }

  async write(item: {
    insert?: DbTabsPack;
    update?: DbTabsPack;
    insertOrUpdate?: DbTabsPack;
    insertOrDoNothing?: DbTabsPack;
    rawQueries?: SQLWrapper[];
    serverTs?: number;
    retryOptions?: Options;
  }): Result.ResultAsync<PackerOutput, WriteError> {
    let {
      insert,
      update,
      insertOrUpdate,
      insertOrDoNothing,
      rawQueries,
      serverTs,
      retryOptions
    } = item;

    return customRetry({
      options: retryOptions ?? getRetryOption(this.cs, this.logger),
      action: async (): Result.ResultAsync<PackerOutput, WriteError> => {
        let rollbackSignal: Error & { cause?: WriteError } = new Error(
          'Transaction domain failure'
        );

        let state: { failure?: Result.Failure<WriteError> } = {};

        try {
          let success: Result.Success<PackerOutput> =
            await this.dbExtra.drizzle.transaction(
              async (tx): Promise<Result.Success<PackerOutput>> => {
                let result: Result.Result<PackerOutput, WriteError> =
                  await this.packer.write({
                    tx: tx,
                    insert: insert,
                    update: update,
                    insertOrUpdate: insertOrUpdate,
                    insertOrDoNothing: insertOrDoNothing,
                    rawQueries: rawQueries,
                    serverTs: serverTs
                  });

                if (Result.isFailure(result)) {
                  state.failure = result;

                  rollbackSignal.cause = result.error;

                  throw rollbackSignal;
                }

                return result;
              }
            );

          return success;
        } catch (error: unknown) {
          if (error === rollbackSignal && isDefined(state.failure)) {
            return state.failure;
          }

          throw error;
        }
      }
    });
  }
}
