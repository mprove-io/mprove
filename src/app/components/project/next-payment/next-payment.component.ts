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
  selector: 'm-next-payment',
  templateUrl: 'next-payment.component.html'
})
export class NextPaymentComponent {
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

class ExampleDataSource extends DataSource<any> {
  constructor(private store: Store<interfaces.AppState>) {
    super();
  }

  connect(): Observable<api.Payment[]> {
    return this.store.select(selectors.getSelectedProjectNextPayment).pipe(
      filter(v => !!v),
      map(p => [p])
    );
  }

  disconnect() {}
}
