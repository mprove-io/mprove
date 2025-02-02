import { common } from '~blockml/barrels/common';

export function wrapStores(item: {
  structId: string;
  stores: common.FileStore[];
}) {
  let { structId, stores } = item;

  let apiStores: common.Store[] = stores.map(x => {
    let store: common.Store = {
      structId: structId,
      storeId: x.name,
      filePath: x.filePath,
      label: x.label,
      serverTs: 1
    };
    return store;
  });

  return apiStores;
}
