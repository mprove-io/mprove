import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { MconfigEnt } from '~backend/drizzle/postgres/schema/mconfigs';
import {
  QueryEnt,
  queriesTable
} from '~backend/drizzle/postgres/schema/queries';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { checkAccess } from '~backend/functions/check-access';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MconfigsService } from '~backend/services/mconfigs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import {
  ToBackendDuplicateMconfigAndQueryRequest,
  ToBackendDuplicateMconfigAndQueryResponsePayload
} from '~common/interfaces/to-backend/mconfigs/to-backend-duplicate-mconfig-and-query';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class DuplicateMconfigAndQueryController {
  constructor(
    private projectsService: ProjectsService,
    private modelsService: ModelsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private structsService: StructsService,
    private mconfigsService: MconfigsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDuplicateMconfigAndQuery)
  async duplicateMconfigAndQuery(
    @AttachUser() user: UserEnt,
    @Req() request: any
  ) {
    let reqValid: ToBackendDuplicateMconfigAndQueryRequest = request.body;

    let { traceId } = reqValid.info;
    let { projectId, isRepoProd, branchId, envId, oldMconfigId } =
      reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: member
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let oldMconfig = await this.mconfigsService.getMconfigCheckExists({
      structId: bridge.structId,
      mconfigId: oldMconfigId
    });

    let model = await this.modelsService.getModelCheckExists({
      structId: bridge.structId,
      modelId: oldMconfig.modelId
    });

    if (oldMconfig.structId !== bridge.structId) {
      throw new ServerError({
        message: ErEnum.BACKEND_STRUCT_ID_CHANGED
      });
    }

    let isAccessGranted = checkAccess({
      userAlias: user.alias,
      member: member,
      entity: model
    });

    if (isAccessGranted === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_FORBIDDEN_MODEL
      });
    }

    let oldQuery = await this.db.drizzle.query.queriesTable.findFirst({
      where: and(
        eq(queriesTable.queryId, oldMconfig.queryId),
        eq(queriesTable.projectId, projectId)
      )
    });

    let newMconfigId = makeId();
    let newQueryId = makeId();

    let newMconfig = Object.assign({}, oldMconfig, <MconfigEnt>{
      mconfigId: newMconfigId,
      queryId: newQueryId,
      temp: true
    });

    let newQuery = Object.assign({}, oldQuery, <QueryEnt>{
      queryId: newQueryId
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                mconfigs: [newMconfig]
              },
              insertOrDoNothing: {
                queries: [newQuery]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload: ToBackendDuplicateMconfigAndQueryResponsePayload = {
      mconfig: this.wrapToApiService.wrapToApiMconfig({
        mconfig: newMconfig,
        modelFields: model.fields
      }),
      query: this.wrapToApiService.wrapToApiQuery(newQuery)
    };

    return payload;
  }
}
