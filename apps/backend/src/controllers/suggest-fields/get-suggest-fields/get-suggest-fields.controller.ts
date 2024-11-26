import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetSuggestFieldsController {
  constructor(
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private envsService: EnvsService,
    private wrapToApiService: WrapToApiService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetSuggestFields)
  async getSuggestFields(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetSuggestFieldsRequest = request.body;

    let { projectId, isRepoProd, branchId, envId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: isRepoProd === true ? common.PROD_REPO_ID : user.userId,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
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

    let models = await this.db.drizzle.query.modelsTable.findMany({
      where: eq(modelsTable.structId, bridge.structId)
    });

    let modelsGrantedAccess = models
      .filter(x =>
        helper.checkAccess({
          userAlias: user.alias,
          member: userMember,
          entity: x
        })
      )
      .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));

    let suggestFields: common.SuggestField[] = [];

    modelsGrantedAccess.forEach(x => {
      x.fields
        .filter(
          y =>
            y.fieldClass === common.FieldClassEnum.Dimension &&
            y.result === common.FieldResultEnum.String
        )
        .sort((a, b) =>
          a.topLabel > b.topLabel ? 1 : b.topLabel > a.topLabel ? -1 : 0
        )
        .forEach(field => {
          let suggestField: common.SuggestField = {
            modelFieldRef: `${x.modelId}.${field.id}`,
            topLabel: x.label,
            partNodeLabel: `${field.topLabel}`,
            partFieldLabel: common.isDefined(field.groupLabel)
              ? `${field.groupLabel} ${field.label}`
              : field.label
          };

          suggestFields.push(suggestField);
        });

      return suggestFields;
    });

    let apiMember = this.wrapToApiService.wrapToApiMember(userMember);

    let payload: apiToBackend.ToBackendGetSuggestFieldsResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.wrapToApiService.wrapToApiStruct(struct),
      userMember: apiMember,
      suggestFields: suggestFields
    };

    return payload;
  }
}
