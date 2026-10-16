import type { OcMessageEntToTabError } from '#common/types/backend/function-errors/oc-message-ent-to-tab-error';
import type { OcPartEntToTabError } from '#common/types/backend/function-errors/oc-part-ent-to-tab-error';

export type LoadMessageHistoryError =
  | OcMessageEntToTabError
  | OcPartEntToTabError;
