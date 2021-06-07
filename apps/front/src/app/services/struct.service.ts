import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { common } from '~front/barrels/common';
import { MconfigQuery } from '../queries/mconfig.query';
import { ModelQuery } from '../queries/model.query';
import { StructQuery } from '../queries/struct.query';
import { UserQuery } from '../queries/user.query';
import { MconfigState } from '../stores/mconfig.store';
import { ModelState } from '../stores/model.store';
import { StructState } from '../stores/struct.store';
import { UserState } from '../stores/user.store';

@Injectable({ providedIn: 'root' })
@Injectable()
export class StructService {
  user: UserState;
  user$ = this.userQuery.select().pipe(
    tap(x => {
      this.user = x;
    })
  );

  struct: StructState;
  struct$ = this.structQuery.select().pipe(
    tap(x => {
      this.struct = x;
    })
  );

  model: ModelState;
  model$ = this.modelQuery.select().pipe(
    tap(x => {
      this.model = x;
    })
  );

  mconfig: MconfigState;
  mconfig$ = this.mconfigQuery.select().pipe(
    tap(x => {
      this.mconfig = x;
    })
  );

  constructor(
    private userQuery: UserQuery,
    public structQuery: StructQuery,
    private modelQuery: ModelQuery,
    private mconfigQuery: MconfigQuery
  ) {
    this.user$.subscribe();
    this.struct$.subscribe();
    this.model$.subscribe();
    this.mconfig$.subscribe();
  }

  makeMconfig(): common.Mconfig {
    let newMconfigId = common.makeId();
    let newQueryId = common.makeId();

    let emptyMconfig: common.Mconfig = {
      structId: this.struct.structId,
      mconfigId: newMconfigId,
      queryId: newQueryId,
      modelId: this.model.modelId,
      select: [],
      sortings: [],
      sorts: null,
      timezone:
        this.user.timezone === common.USE_PROJECT_TIMEZONE
          ? this.struct.defaultTimezone
          : this.user.timezone,
      limit: 500,
      filters: [],
      charts: [],
      temp: true,
      serverTs: 1
    };

    return common.isDefined(this.mconfig.structId)
      ? Object.assign({}, this.mconfig, <common.Mconfig>{
          mconfigId: newMconfigId,
          queryId: newQueryId,
          temp: true,
          serverTs: 1
        })
      : emptyMconfig;
  }
}
