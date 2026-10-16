import type { DconfigEntToTabError } from '#common/types/backend/function-errors/dconfig-ent-to-tab-error';
import type { TabsPackToEntsPackError } from '#common/types/backend/function-errors/tabs-pack-to-ents-pack-error';

export type WriteError = DconfigEntToTabError | TabsPackToEntsPackError;
