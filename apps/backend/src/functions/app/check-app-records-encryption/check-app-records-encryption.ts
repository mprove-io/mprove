import type { ConfigService } from '@nestjs/config';
import { isNotNull } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type DconfigTab,
  dconfigsTable
} from '#backend/drizzle/postgres/tables/dconfigs';
import { createHashSecret } from '#backend/functions/hash/create-hash-secret/create-hash-secret';
import type { DbService } from '#backend/services/db/db.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';

export async function checkAppRecordsEncryption(item: {
  cs: ConfigService<BackendConfig>;
  db: DbService;
}): Promise<void> {
  let { cs, db } = item;

  let keyBase64: BackendConfig['aesKey'] =
    cs.get<BackendConfig['aesKey']>('aesKey');
  let keyTag: BackendConfig['aesKeyTag'] =
    cs.get<BackendConfig['aesKeyTag']>('aesKeyTag');

  let prevKeyBase64: BackendConfig['prevAesKey'] =
    cs.get<BackendConfig['prevAesKey']>('prevAesKey');
  let prevKeyTag: BackendConfig['prevAesKeyTag'] =
    cs.get<BackendConfig['prevAesKeyTag']>('prevAesKeyTag');

  let isEncryptDb: BackendConfig['isEncryptDb'] =
    cs.get<BackendConfig['isEncryptDb']>('isEncryptDb');

  let isEncryptMetadata: BackendConfig['isEncryptMetadata'] =
    cs.get<BackendConfig['isEncryptMetadata']>('isEncryptMetadata');

  if (isEncryptMetadata === true && isEncryptDb === false) {
    throw new ServerError({
      message: 'BACKEND_ENCRYPT_METADATA_DOES_NOT_WORK_WITHOUT_ENCRYPT_DB'
    });
  }

  if (isUndefined(keyBase64)) {
    throw new ServerError({
      message: 'BACKEND_AES_KEY_IS_NOT_DEFINED'
    });
  }

  if (isUndefined(keyTag)) {
    throw new ServerError({
      message: 'BACKEND_AES_KEY_TAG_IS_NOT_DEFINED'
    });
  }

  if (isDefined(prevKeyBase64) && isUndefined(prevKeyTag)) {
    throw new ServerError({
      message:
        'BACKEND_PREV_AES_KEY_IS_DEFINED_BUT_PREV_AES_KEY_TAG_IS_NOT_DEFINED'
    });
  }

  let dconfigA: DconfigTab = await db.dconfigs.findFirstUnwrap({
    where: isNotNull(dconfigsTable.dconfigId)
  });

  if (isUndefined(dconfigA)) {
    throw new ServerError({
      message: 'BACKEND_DCONFIG_IS_NOT_DEFINED'
    });
  }

  let isUpdateHashSecret = false;

  if (
    (isEncryptDb === true && dconfigA.keyTag !== keyTag) ||
    dconfigA.hashSecret !== dconfigA.hashSecretCheck
  ) {
    isUpdateHashSecret = true;
  }

  if (isUpdateHashSecret === true) {
    dconfigA.hashSecret = createHashSecret(); // hashSecretCheck is prev value

    await db.writeUnwrap({
      update: {
        dconfigs: [dconfigA] // tab-to-ent sets keyTag
      }
    });
  }

  await db.rewriteRecordsUnwrap({
    isAllRecords: isUpdateHashSecret
  });

  let dconfigB: DconfigTab = await db.dconfigs.findFirstUnwrap({
    where: isNotNull(dconfigsTable.dconfigId)
  });

  dconfigB.hashSecretCheck = dconfigB.hashSecret;

  await db.writeUnwrap({
    update: {
      dconfigs: [dconfigB] // tab-to-ent sets keyTag
    }
  });
}
