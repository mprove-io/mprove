import { Controller, Post } from '@nestjs/common';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';

@Controller()
export class CreateTempMconfigController {
  constructor(private connection: Connection) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateTempMconfig)
  async createTempMconfig(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateTempMconfigRequest)
    reqValid: apiToBackend.ToBackendCreateTempMconfigRequest
  ) {
    let { mconfig } = reqValid.payload;

    mconfig.temp = true;

    await this.connection.transaction(async manager => {
      await db.addRecords({
        manager: manager,
        records: {
          mconfigs: [wrapper.wrapToEntityMconfig(mconfig)]
        }
      });
    });

    let payload = {};

    return payload;
  }
}
