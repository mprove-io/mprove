import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import * as actions from '@app/store-actions/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store/selectors/_index';

@Injectable()
export class LiveQueriesService {
  constructor(private store: Store<interfaces.AppState>) {}

  setLiveQueries(queryIds: string[]) {
    this.store
      .select(selectors.getLqState)
      .pipe(take(1))
      .subscribe(lq => {
        if (
          queryIds.length > 0 &&
          JSON.stringify(lq.live_queries) !== JSON.stringify(queryIds)
        ) {
          this.store.dispatch(
            new actions.SetLiveQueriesAction({
              live_queries: queryIds,
              server_ts: lq.server_ts
            })
          );
        }
      });
  }
}
