import { ApStruct } from './barrels/ap-struct';
import { api } from './barrels/api';
import { interfaces } from './barrels/interfaces';

let abc = ApStruct.rebuildStruct({
  // dir: 'test/sql/11_wherecalc_refs_calc/v27',
  dir: 'test/manual/m1',
  weekStart: api.ProjectWeekStartEnum.Monday,
  connection: api.ProjectConnectionEnum.BigQuery,
  bqProject: 'flow-1202',
  projectId: 'w',
  structId: 't'
})
  .then((struct: interfaces.Struct) => {
    console.log('struct:', struct);
  })
  .catch(err => {
    console.log(err.stack);
  });
