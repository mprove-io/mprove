import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { modelsTable } from '~backend/drizzle/postgres/schema/models';
import { checkAccess } from '~backend/functions/check-access';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapEnxToApiService } from '~backend/services/wrap-to-api.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FieldResultEnum } from '~common/enums/field-result.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { SuggestField } from '~common/interfaces/backend/suggest-field';
import {
  ToBackendGetSuggestFieldsRequest,
  ToBackendGetSuggestFieldsResponsePayload
} from '~common/interfaces/to-backend/suggest-fields/to-backend-get-suggest-fields';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetSuggestFieldsController {
  constructor(
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
    private envsService: EnvsService,
    private wrapToApiService: WrapEnxToApiService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetSuggestFields)
  async getSuggestFields(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetSuggestFieldsRequest = request.body;

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

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let payload: ToBackendGetSuggestFieldsResponsePayload = {
      needValidate: bridge.needValidate,
      struct: this.structsService.tabToApi({ struct: struct }),
      userMember: apiMember,
      suggestFields: suggestFields
    };

    return payload;
  }
}
