import { PostgresConnection } from '@malloydata/db-postgres';
import {
  ModelMaterializer,
  PreparedQuery,
  PreparedResult,
  QueryMaterializer,
  Runtime
} from '@malloydata/malloy';
import { ModelDef as MalloyModelDef } from '@malloydata/malloy';
import { ConfigService } from '@nestjs/config';
import * as fse from 'fs-extra';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';

let func = common.FuncEnum.BuildMalloyQuery;

export async function buildMalloyQuery(
  item: {
    malloyConnections: PostgresConnection[];
    malloyModelDef: MalloyModelDef;
    malloyQuery: string;
    // errors: BmError[];
    // structId: string;
    // caller: common.CallerEnum;
  },
  cs: ConfigService<interfaces.Config>
) {
  let {
    malloyModelDef,
    malloyQuery
    // errors,
    // structId,
    // caller,
  } = item;
  // helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

  // console.log('malloyQuery');
  // console.log(malloyQuery);

  // console.log('malloyModelDef');
  // console.log(malloyModelDef);

  // let start100 = Date.now();
  let runtime = new Runtime({
    urlReader: {
      readURL: async (url: URL) => await fse.readFile(url, 'utf8')
    },
    connections: {
      lookupConnection: async function (name: string) {
        return item.malloyConnections.find(mc => mc.name === name);
      }
    }
  });

  let mm: ModelMaterializer = runtime._loadModelFromModelDef(malloyModelDef);
  // console.log('diff100');
  // console.log(Date.now() - start100); // 0ms

  // let start101 = Date.now();
  let qm: QueryMaterializer = mm.loadQuery(malloyQuery); // 0 ms
  // console.log('diff101');
  // console.log(Date.now() - start101); // 0ms

  // let start102 = Date.now();

  // let aSql = await qm.getSQL();

  // console.log('diff102');
  // console.log(Date.now() - start102); // 14ms

  // console.log('aSql');
  // console.log(aSql);

  // let start103 = Date.now();
  let pq: PreparedQuery = await qm.getPreparedQuery();
  let pr: PreparedResult = pq.getPreparedResult();

  // console.log('diff103');
  // console.log(Date.now() - start103); // 15ms

  // console.log('pq');
  // console.dir(pq, { depth: null });

  // console.log('pr.sql')
  // console.log(pr.sql)

  return pr;
}
