import { DataSource } from '@angular/cdk/collections';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store/selectors/_index';

@Component({
  moduleId: module.id,
  selector: 'm-payments',
  templateUrl: 'payments.component.html'
})
export class PaymentsComponent {
  selectedProjectAnalyticsSubscription: api.Subscription;
  selectedProjectAnalyticsSubscription$ = this.store
    .select(selectors.getSelectedProjectAnalyticsSubscription)
    .pipe(
      filter(v => !!v),
      tap(x => (this.selectedProjectAnalyticsSubscription = x))
    );

  displayedColumns = [
    'payout_date',
    'subscription_id',
    'payment_id',
    'plan_id',
    'amount',
    'is_paid',
    'receipt_url'
  ];
  dataSource = new ExampleDataSource(this.store);

  selectedProjectAnalyticsPlans: interfaces.AnalyticsPlan[];
  selectedProjectAnalyticsPlans$ = this.store
    .select(selectors.getSelectedProjectAnalyticsPlans)
    .pipe(tap(x => (this.selectedProjectAnalyticsPlans = x)));
  constructor(private store: Store<interfaces.AppState>) {}

  getPlanNameById(planId: number) {
    let plan = this.selectedProjectAnalyticsPlans.find(
      p => p.analytics_plan_id === planId
    );

    return plan ? plan.name : 'Unknown';
  }
}

/**
 * Data source to provide what data should be rendered in the table. The observable provided
 * in connect should emit exactly the data that should be rendered by the table. If the data is
 * altered, the observable should emit that new set of data on the stream. In our case here,
 * we return a stream that contains only one set of data that doesn't change.
 */
class ExampleDataSource extends DataSource<any> {
  /** Connect function called by the table to retrieve one stream containing the data to render. */

  constructor(private store: Store<interfaces.AppState>) {
    super();
  }

  connect(): Observable<api.Payment[]> {
    return this.store
      .select(selectors.getSelectedProjectPayments)
      .pipe(map(payments => payments.filter(p => p.is_paid)));
  }

  disconnect() {}
}
