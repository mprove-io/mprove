import type { GetBridgeCheckExistsError } from '#common/types/backend/function-errors/get-bridge-check-exists-error';
import type { GetCacheEnvIdError } from '#common/types/backend/function-errors/get-cache-env-id-error';
import type { GetEnvCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-env-check-exists-and-access-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { ModelEntToTabError } from '#common/types/backend/function-errors/model-ent-to-tab-error';
import type { SearchDwhSchemaFieldNamesError } from '#common/types/backend/function-errors/search-dwh-schema-field-names-error';

export type SearchModelFieldsError =
  | GetProjectCheckExistsError
  | GetMemberCheckExistsError
  | GetEnvCheckExistsAndAccessError
  | GetBridgeCheckExistsError
  | ModelEntToTabError
  | GetCacheEnvIdError
  | SearchDwhSchemaFieldNamesError;
