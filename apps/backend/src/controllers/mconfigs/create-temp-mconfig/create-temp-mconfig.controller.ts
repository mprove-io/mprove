import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { DbService } from '~backend/services/db.service';
import { MconfigsService } from '~backend/services/mconfigs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { StructsService } from '~backend/services/structs.service';

@Controller()
export class CreateTempMconfigController {
  constructor(
    private dbService: DbService,
    private modelsService: ModelsService,
    private mconfigsService: MconfigsService,
    private membersService: MembersService,
    private structsService: StructsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateTempMconfig)
  async createTempMconfig(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateTempMconfigRequest)
    reqValid: apiToBackend.ToBackendCreateTempMconfigRequest
  ) {
    let { oldMconfigId, mconfig } = reqValid.payload;

    let oldMconfig = await this.mconfigsService.getMconfigCheckExists({
      mconfigId: oldMconfigId
    });

    if (
      oldMconfig.query_id !== mconfig.queryId ||
      oldMconfig.model_id !== mconfig.modelId ||
      oldMconfig.struct_id !== mconfig.structId
    ) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_OLD_MCONFIG_MISMATCH
      });
    }

    let struct = await this.structsService.getStructCheckExists({
      structId: mconfig.structId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: struct.project_id,
      memberId: user.user_id
    });

    let model = await this.modelsService.getModelCheckExists({
      modelId: mconfig.modelId,
      structId: mconfig.structId
    });

    let isAccessGranted = helper.checkAccess({
      userAlias: user.alias,
      member: member,
      vmd: model
    });

    if (isAccessGranted === false) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_FORBIDDEN_MODEL
      });
    }

    mconfig.temp = true;

    await this.dbService.writeRecords({
      modify: false,
      records: {
        mconfigs: [wrapper.wrapToEntityMconfig(mconfig)]
      }
    });

    let payload = {};

    return payload;
  }
}
