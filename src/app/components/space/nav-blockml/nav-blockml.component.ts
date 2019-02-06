import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, tap } from 'rxjs/operators';
import * as interfaces from '@app/interfaces/_index';
import * as enums from '@app/enums/_index';
import * as selectors from '@app/store/selectors/_index';

@Component({
  selector: 'm-nav-blockml',
  templateUrl: 'nav-blockml.component.html',
  styleUrls: ['nav-blockml.component.scss']
})
export class NavBlockmlComponent {
  projectId: string;
  projectId$ = this.store
    .select(selectors.getLayoutProjectId)
    .pipe(tap(x => (this.projectId = x))); // no filter here

  mode: enums.LayoutModeEnum;
  mode$ = this.store.select(selectors.getLayoutMode).pipe(
    filter(v => !!v),
    tap(x => (this.mode = x))
  );

  constructor(private store: Store<interfaces.AppState>) {}
}
