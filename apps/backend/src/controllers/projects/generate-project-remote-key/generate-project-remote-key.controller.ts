import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import * as crypto from 'crypto';
import { parseKey, parsePrivateKey } from 'sshpk';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { makeNote } from '~backend/models/maker/_index';
import { NoteEntity } from '~backend/models/store-entities/_index';
import { DbService } from '~backend/services/db.service';
import { OrgsService } from '~backend/services/orgs.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GenerateProjectRemoteKeyController {
  constructor(private dbService: DbService, private orgsService: OrgsService) {}

  @Post(
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGenerateProjectRemoteKey
  )
  async createProject(
    @AttachUser() user: schemaPostgres.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGenerateProjectRemoteKeyRequest =
      request.body;

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
        cipher: 'aes-256-cbc',
        passphrase: common.PASS_PHRASE
      }
    });

    let sshPublicKey = parseKey(publicKey, 'pem', {
      passphrase: common.PASS_PHRASE
    }).toString('ssh');

    let sshPrivateKey = parsePrivateKey(privateKey, 'pem', {
      passphrase: common.PASS_PHRASE
    }).toString('ssh');

    let note: NoteEntity = makeNote({
      publicKey: sshPublicKey,
      privateKey: sshPrivateKey
    });

    await this.dbService.writeRecords({
      modify: false,
      records: {
        notes: [note]
      }
    });

    let payload: apiToBackend.ToBackendGenerateProjectRemoteKeyResponsePayload =
      {
        noteId: note.note_id,
        publicKey: note.public_key
      };

    return payload;
  }
}
