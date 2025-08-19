import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { eq } from 'drizzle-orm';

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
  async getSuggestFields(@AttachUser() user: UserEnt, @Req() request: any) {
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
      repoId: isRepoProd === true ? PROD_REPO_ID : user.userId,
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
        checkAccess({
          userAlias: user.alias,
          member: userMember,
          entity: x
        })
      )
      .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));

    let suggestFields: SuggestField[] = [];

    modelsGrantedAccess.forEach(x => {
      x.fields
        .filter(
          y =>
            y.hidden === false &&
            y.fieldClass === FieldClassEnum.Dimension &&
            y.result === FieldResultEnum.String
        )
        .forEach(field => {
          let partFieldLabel = isDefined(field.groupLabel)
            ? `${field.groupLabel} ${field.label}`
            : field.label;

          let suggestField: SuggestField = {
            modelFieldRef: `${x.modelId}.${field.id}`,
            topLabel: x.label,
            partNodeLabel: field.topLabel,
            partFieldLabel: partFieldLabel,
            partLabel: `${x.label} ${field.topLabel} ${partFieldLabel}`,
            fieldClass: field.fieldClass,
            result: field.result
          };

          suggestFields.push(suggestField);
        });

      return suggestFields;
    });

    suggestFields = suggestFields.sort((a, b) =>
      a.fieldClass !== FieldClassEnum.Dimension &&
      b.fieldClass === FieldClassEnum.Dimension
        ? 1
        : a.fieldClass === FieldClassEnum.Dimension &&
            b.fieldClass !== FieldClassEnum.Dimension
          ? -1
          : a.fieldClass !== FieldClassEnum.Filter &&
              b.fieldClass === FieldClassEnum.Filter
            ? 1
            : a.fieldClass === FieldClassEnum.Filter &&
                b.fieldClass !== FieldClassEnum.Filter
              ? -1
              : a.partLabel > b.partLabel
                ? 1
                : b.partLabel > a.partLabel
                  ? -1
                  : 0
    );

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
