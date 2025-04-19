import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { parseKey, parsePrivateKey } from 'sshpk';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { OrgsService } from '~backend/services/orgs.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class GenerateProjectRemoteKeyController {
  constructor(
    private orgsService: OrgsService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGenerateProjectRemoteKey
  )
  async createProject(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGenerateProjectRemoteKeyRequest =
      request.body;

    let { traceId } = reqValid.info;
    let { orgId } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.userId
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

    let note: schemaPostgres.NoteEnt = {
      noteId: common.makeId(),
      publicKey: sshPublicKey,
      privateKey: sshPrivateKey,
      serverTs: undefined
    };

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                notes: [note]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload: apiToBackend.ToBackendGenerateProjectRemoteKeyResponsePayload =
      {
        noteId: note.noteId,
        publicKey: note.publicKey
      };

    return payload;
  }
}
