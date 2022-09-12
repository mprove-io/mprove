import { Controller, Post } from '@nestjs/common';
import * as crypto from 'crypto';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { makeNote } from '~backend/models/maker/_index';
import { NoteEntity } from '~backend/models/store-entities/_index';
import { DbService } from '~backend/services/db.service';
import { OrgsService } from '~backend/services/orgs.service';

@Controller()
export class GenerateProjectRemoteKeyController {
  constructor(private dbService: DbService, private orgsService: OrgsService) {}

  @Post(
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGenerateProjectRemoteKey
  )
  async createProject(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateProjectRequest)
    reqValid: apiToBackend.ToBackendCreateProjectRequest
  ) {
    let { traceId } = reqValid.info;
    let { orgId } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.user_id
    });

    let { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc'
      }
    });

    let note: NoteEntity = makeNote({
      privateKey: privateKey,
      publicKey: publicKey
    });

    await this.dbService.writeRecords({
      modify: false,
      records: {
        notes: [note]
      }
    });

    let payload: apiToBackend.ToBackendGenerateProjectRemoteKeyResponsePayload = {
      noteId: note.note_id,
      publicKey: note.public_key
    };

    return payload;
  }
}
