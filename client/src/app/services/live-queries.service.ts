import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';

@Injectable()
export class LiveQueriesService {
  constructor(private store: Store<interfaces.AppState>) {}

  setLiveQueries(queryIds: string[]) {
    this.store
      .select(selectors.getWebSocketInitId)
      .pipe(take(1))
      .subscribe(initId => {
        this.store.dispatch(
          new actions.SetLiveQueriesAction({
            init_id: initId,
            live_queries: queryIds
          })
        );
      });
  }
}
