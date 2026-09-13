import type { ToDiskOperation } from '#common/zod/disk/request/to-disk-operation';
import type { ToDiskRequestForOperation } from '#common/zod/disk/request/to-disk-request-for-operation';

export type ToDiskRequest = ToDiskRequestForOperation<ToDiskOperation>;
