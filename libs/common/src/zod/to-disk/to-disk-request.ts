import type { ToDiskOperation } from '#common/zod/to-disk/to-disk-operation';
import type { ToDiskRequestForOperation } from '#common/zod/to-disk/to-disk-request-for-operation';

export type ToDiskRequest = ToDiskRequestForOperation<ToDiskOperation>;
