import { Result } from '@praha/byethrow';
import type { TabService } from '#backend/services/tab/tab.service';
import type { TabProps } from '#backend/types/tab-props';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetTabPropsError } from '#common/types/backend/function-errors/get-tab-props-error';

export function getTabProps<ST, LT>(item: {
  ent: {
    st: {
      encrypted: string;
      decrypted: ST;
    };
    lt: {
      encrypted: string;
      decrypted: LT;
    };
    keyTag: string;
  };
  tabService: TabService;
}): Result.Result<TabProps<ST, LT>, GetTabPropsError> {
  let { ent, tabService } = item;

  let isDefinedStAndUndefinedEncrypted =
    isDefined(ent.st) && isUndefined(ent.st.encrypted);

  let isDefinedStAndUndefinedDecrypted =
    isDefined(ent.st) && isUndefined(ent.st.decrypted);

  let isDefinedLtAndUndefinedEncrypted =
    isDefined(ent.lt) && isUndefined(ent.lt.encrypted);

  let isDefinedLtAndUndefinedDecrypted =
    isDefined(ent.lt) && isUndefined(ent.lt.decrypted);

  if (
    (isDefinedStAndUndefinedEncrypted || isDefinedLtAndUndefinedEncrypted) &&
    (isDefinedStAndUndefinedDecrypted || isDefinedLtAndUndefinedDecrypted)
  ) {
    return Result.fail({
      code: 'BACKEND_DB_RECORD_HAS_NO_DECRYPTED_AND_NO_ENCRYPTED_PROPS'
    });
  }

  if (
    (isDefined(ent.st?.encrypted) || isDefined(ent.lt?.encrypted)) &&
    (isDefined(ent.st?.decrypted) || isDefined(ent.lt?.decrypted))
  ) {
    return Result.fail({
      code: 'BACKEND_DB_RECORD_HAS_BOTH_DECRYPTED_AND_ENCRYPTED_PROPS'
    });
  }

  if (
    isDefined(ent.keyTag) &&
    (isDefined(ent.st?.decrypted) || isDefined(ent.lt?.decrypted))
  ) {
    return Result.fail({
      code: 'BACKEND_DB_RECORD_IS_DECRYPTED_BUT_HAS_KEY_TAG'
    });
  }

  if (
    isDefined(ent.keyTag) &&
    [tabService.keyTag, tabService.prevKeyTag].indexOf(ent.keyTag) < 0
  ) {
    return Result.fail({
      code: 'BACKEND_DB_RECORD_KEY_TAG_DOES_NOT_MATCH_CURRENT_OR_PREV'
    });
  }

  let keyBuffer: Buffer =
    isDefined(ent.keyTag) && ent.keyTag === tabService.keyTag
      ? tabService.keyBuffer
      : isDefined(ent.keyTag) && ent.keyTag === tabService.prevKeyTag
        ? tabService.prevKeyBuffer
        : undefined;

  let props: ST & LT = isDefined(ent.keyTag)
    ? {
        ...tabService.decrypt<ST>({
          encryptedString: ent.st?.encrypted,
          keyBuffer: keyBuffer
        }),
        ...tabService.decrypt<LT>({
          encryptedString: ent.lt?.encrypted,
          keyBuffer: keyBuffer
        })
      }
    : {
        ...(ent.st?.decrypted ?? ({} as ST)),
        ...(ent.lt?.decrypted ?? ({} as LT))
      };

  return Result.succeed({ props: props });
}
