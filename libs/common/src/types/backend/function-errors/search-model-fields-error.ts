import type { DbBridgesFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/bridges/db-bridges-find-first-check-exists-error';
import type { DbMembersFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/members/db-members-find-first-check-exists-error';
import type { DbModelsFindManyError } from '#common/types/backend/function-errors/db/models/db-models-find-many-error';
import type { DbProjectsFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/projects/db-projects-find-first-check-exists-error';
import type { GetCacheEnvIdError } from '#common/types/backend/function-errors/get-cache-env-id-error';
import type { GetEnvCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-env-check-exists-and-access-error';
import type { SearchDwhSchemaFieldNamesError } from '#common/types/backend/function-errors/search-dwh-schema-field-names-error';

export type SearchModelFieldsError =
  | DbProjectsFindFirstCheckExistsError
  | DbMembersFindFirstCheckExistsError
  | GetEnvCheckExistsAndAccessError
  | DbBridgesFindFirstCheckExistsError
  | DbModelsFindManyError
  | GetCacheEnvIdError
  | SearchDwhSchemaFieldNamesError;
