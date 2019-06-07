import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { helper } from '../../barrels/helper';
import { store } from '../../barrels/store';
import { forEachSeries } from 'p-iteration';

export async function getQueryUsingPdtTriggerSqlPostgresQueryJobId(item: {
  query_id: string;
  pdt_trigger_sql_postgres_query_job_id: string;
}) {
  let storeQueries = store.getQueriesRepo();

  let stop = false;

  let q: entities.QueryEntity;

  await forEachSeries([...Array(5).keys()], async x => {
    if (stop === false) {
      q = <entities.QueryEntity>(
        await storeQueries
          .findOne(item.query_id)
          .catch(e =>
            helper.reThrow(e, enums.storeErrorsEnum.STORE_QUERIES_FIND_ONE)
          )
      );

      if (
        q &&
        q.pdt_trigger_sql_postgres_query_job_id ===
          item.pdt_trigger_sql_postgres_query_job_id
      ) {
        stop = true;
      } else {
        console.log('getQueryUsingPdtTriggerSqlPostgresQueryJobId - sleep');
        await helper.sleepMs(2000);
      }
    }
  });

  return q;
}
