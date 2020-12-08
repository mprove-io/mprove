import { api } from '../../barrels/api';
import { interfaces } from '../../barrels/interfaces';
import { BmError } from '../bm-error';
import { enums } from '../../barrels/enums';
import { genSqlPro } from './gen-sql-pro';

export async function genSql(item: {
  model: interfaces.Model;
  select: string[];
  sorts: string;
  limit: string;
  filters: { [filter: string]: string[] };
  udfs: interfaces.Udf[];
  timezone: string;
  weekStart: api.ProjectWeekStartEnum;
  projectId: string;
  errors: BmError[];
  structId: string;
  caller: enums.CallerEnum;
}) {
  // if (Object.keys(cluster.workers).length === 0) {
  //   let itemId = helper.makeId();
  //   await redisClient.set(itemId, JSON.stringify(item));
  //   let itemFromRedis = await redisClient.get(itemId);
  //   await redisClient.del(itemId);

  //   let itemFromRedisParsed = JSON.parse(itemFromRedis);
  //   let outcome = genBqViewsPro(itemFromRedisParsed);

  //   let outcomeId = helper.makeId();
  //   await redisClient.set(outcomeId, JSON.stringify(outcome));
  //   let outcomeFromRedis = await redisClient.get(outcomeId);
  //   await redisClient.del(outcomeId);

  //   let outcomeFromRedisParsed = JSON.parse(outcomeFromRedis);
  //   return outcomeFromRedisParsed;

  //   // let outcome = genBqViewsPro(item);
  //   // return outcome;
  // } else {
  //   let taskId = helper.makeId();
  //   let outcomeId = helper.makeId();

  //   let aWorker;

  //   aWorker = await ServerWorkers.get();

  //   await redisClient.set(taskId, JSON.stringify(item));

  //   // send message to worker
  //   await aWorker.send({
  //     type: enums.ProEnum.GEN_BQ_VIEWS_PRO,
  //     task_id: taskId,
  //     outcome_id: outcomeId
  //   });

  //   let outcome = await ServerOutcomes.get(outcomeId);

  //   if (outcome === enums.ProEnum.PRO_ERROR) {
  //     let proErr = ServerProErrors.get(outcomeId);

  //     ServerProErrors.delete(outcomeId);

  //     throw proErr;
  //   } else {
  //     ServerOutcomes.delete(outcomeId);

  //     return outcome;
  //   }
  // }

  let outcome = genSqlPro(item);
  return outcome;
}
