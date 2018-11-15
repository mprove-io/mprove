import { ApStruct } from './barrels/ap-struct';
import { api } from './barrels/api';
import { interfaces } from './barrels/interfaces';

let abc = ApStruct.rebuildStruct({
  // dir: '/mprove/basedir/mprove-akalitenya-wood-t/dev',
  dir: '/mprove/basedir/project/mprove-akalitenya-mprove-main',
  // dir: 'test/unit/03_view/e285',
  // dir: 'test',
  // dir: 'test/valid/11_wherecalc_refs_calc/v27',
  // dir: 'test/manual/m1',
  weekStart: api.ProjectWeekStartEnum.Monday,
  bqProject: 'flow-1202',
  projectId: 'Wood',
  structId: 't'
})
  .then((struct: interfaces.Struct) => {
    console.log('struct:', struct);
  })
  .catch(err => {
    console.log(err.stack);
  });
