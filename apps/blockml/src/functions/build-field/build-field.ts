import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BmError } from '#blockml/classes/bm-error/bm-error';
import type { BlockmlConfig } from '#blockml/config/blockml-config';
import { checkAndSetImplicitFormatNumber } from '#blockml/functions/build-field/check-and-set-implicit-format-number/check-and-set-implicit-format-number';
import { checkAndSetImplicitResult } from '#blockml/functions/build-field/check-and-set-implicit-result/check-and-set-implicit-result';
import { checkFieldDeclaration } from '#blockml/functions/build-field/check-field-declaration/check-field-declaration';
import { checkFieldIsObject } from '#blockml/functions/build-field/check-field-is-object/check-field-is-object';
import { checkFieldNameDuplicates } from '#blockml/functions/build-field/check-field-name-duplicates/check-field-name-duplicates';
import { checkFieldUnknownParameters } from '#blockml/functions/build-field/check-field-unknown-parameters/check-field-unknown-parameters';
import { checkFieldsExist } from '#blockml/functions/build-field/check-fields-exist/check-fields-exist';
import { checkStoreFieldDetail } from '#blockml/functions/build-field/check-store-field-detail/check-store-field-detail';
import { checkStoreFieldGroup } from '#blockml/functions/build-field/check-store-field-group/check-store-field-group';
import { setImplicitLabel } from '#blockml/functions/build-field/set-implicit-label/set-implicit-label';
import { CallerEnum } from '#common/enums/special/caller.enum';
import type { sdrType } from '#common/types/sdr-type';
import type { FileProjectConf } from '#common/zod/blockml/internal/file-project-conf';
import type { FileStore } from '#common/zod/blockml/internal/file-store';

export function buildField<T extends sdrType>(item: {
  entities: T[];
  projectConfig: FileProjectConf;
  errors: BmError[];
  structId: string;
  caller: CallerEnum;
  cs: ConfigService<BlockmlConfig>;
}): Result.Result<T[], never> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind(
      'entities',
      (v): Result.Result<T[], never> =>
        checkFieldsExist({
          entities: v.entities,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'entities',
      (v): Result.Result<T[], never> =>
        checkFieldIsObject({
          entities: v.entities,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'entities',
      (v): Result.Result<T[], never> =>
        checkFieldDeclaration({
          entities: v.entities,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    // parameters added to fields
    Result.bind(
      'entities',
      (v): Result.Result<T[], never> =>
        checkFieldNameDuplicates({
          entities: v.entities,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'entities',
      (v): Result.Result<T[], never> =>
        checkFieldUnknownParameters({
          entities: v.entities,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'entities',
      (v): Result.Result<T[], never> =>
        setImplicitLabel({
          entities: v.entities,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'entities',
      (v): Result.Result<T[], never> =>
        checkAndSetImplicitResult({
          entities: v.entities,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    ),
    Result.bind(
      'entities',
      (v): Result.Result<T[], never> =>
        v.caller === CallerEnum.BuildStoreField
          ? (checkStoreFieldGroup({
              stores: v.entities as FileStore[],
              structId: v.structId,
              errors: v.errors,
              caller: v.caller,
              cs: v.cs
            }) as Result.Result<T[], never>)
          : Result.succeed(v.entities)
    ),
    Result.bind(
      'entities',
      (v): Result.Result<T[], never> =>
        v.caller === CallerEnum.BuildStoreField
          ? (checkStoreFieldDetail({
              stores: v.entities as FileStore[],
              structId: v.structId,
              errors: v.errors,
              caller: v.caller,
              cs: v.cs
            }) as Result.Result<T[], never>)
          : Result.succeed(v.entities)
    ),
    Result.andThen(
      (v): Result.Result<T[], never> =>
        checkAndSetImplicitFormatNumber({
          entities: v.entities,
          projectConfig: v.projectConfig,
          structId: v.structId,
          errors: v.errors,
          caller: v.caller,
          cs: v.cs
        })
    )
  );
}
