import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { store } from '../../barrels/store';
import { getConnection } from 'typeorm';

export async function saveQueryToDatabase(item: {
  new_server_ts: string;
  query: entities.QueryEntity;
}) {
  let query = item.query;
  let newServerTs = item.new_server_ts;

  // save to database

  let connection = getConnection();

  await connection
    .transaction(async manager => {
      await store
        .save({
          manager: manager,
          records: {
            queries: [query]
          },
          server_ts: newServerTs,
          skip_chunk: false,
          source_init_id: undefined
        })
        .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SAVE));
    })
    .catch(e => helper.reThrow(e, enums.typeormErrorsEnum.TYPEORM_TRANSACTION));
}
