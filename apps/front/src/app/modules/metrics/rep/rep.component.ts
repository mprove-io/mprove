import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs';
import { RepQuery } from '~front/app/queries/rep.query';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-rep',
  templateUrl: './rep.component.html'
})
export class RepComponent {
  rep: common.Rep;
  rep$ = this.repQuery.select().pipe(
    tap(x => {
      this.rep = x;
      this.cd.detectChanges();
    })
  );

  constructor(private cd: ChangeDetectorRef, private repQuery: RepQuery) {}
}
