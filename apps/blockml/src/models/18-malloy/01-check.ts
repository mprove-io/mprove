// import { ConfigService } from '@nestjs/config';
// import { common } from '~blockml/barrels/common';
// import { helper } from '~blockml/barrels/helper';
// import { interfaces } from '~blockml/barrels/interfaces';
// import { BmError } from '~blockml/models/bm-error';
// import * as malloy from '@malloydata/malloy';

// async function checkMalloy(
//   item: {
//     errors: BmError[];
//     structId: string;
//     caller: common.CallerEnum;
//   },
//   cs: ConfigService<interfaces.Config>
// ) {
//   let { caller, structId } = item;
//   helper.log(cs, caller, func, structId, common.LogTypeEnum.Input, item);

//   helper.log(
//     cs,
//     caller,
//     func,
//     structId,
//     common.LogTypeEnum.Errors,
//     item.errors
//   );
//   helper.log(
//     cs,
//     caller,
//     func,
//     structId,
//     common.LogTypeEnum.Reports,
//     newReports
//   );

//   return newReports;
// }
