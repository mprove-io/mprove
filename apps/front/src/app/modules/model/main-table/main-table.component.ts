import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { MconfigQuery } from '~front/app/queries/mconfig.query';
import { QueryQuery } from '~front/app/queries/query.query';
import { MconfigState } from '~front/app/stores/mconfig.store';
import { QueryState } from '~front/app/stores/query.store';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-main-table',
  templateUrl: './main-table.component.html'
})
export class MainTableComponent {
  sortedColumns: common.ModelField[];
  mconfigSelectModelFields$ = this.mconfigQuery.selectModelFields$.pipe(
    tap(x => {
      this.sortedColumns = x;
      this.cd.detectChanges();
    })
  );

  mconfig: MconfigState;
  mconfig$ = this.mconfigQuery.select().pipe(
    tap(x => {
      this.mconfig = x;
      this.cd.detectChanges();
    })
  );

  filteredData: any = [];

  query: QueryState;
  query$ = this.queryQuery.select().pipe(
    tap(x => {
      this.query = x;
      this.filteredData = x.data;
      this.cd.detectChanges();
    })
  );

  constructor(
    public mconfigQuery: MconfigQuery,
    public queryQuery: QueryQuery,
    private cd: ChangeDetectorRef
  ) {}
}
