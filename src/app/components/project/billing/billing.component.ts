import { DataSource } from '@angular/cdk/collections';
import { Component, Inject, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';
import * as api from 'app/api/_index';
import * as configs from 'app/configs/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';
import * as services from 'app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-billing',
  templateUrl: 'billing.component.html',
  styleUrls: ['billing.component.scss']
})
export class BillingComponent implements OnDestroy {
  selectedProjectId$ = this.store
    .select(selectors.getSelectedProjectId)
    .pipe(filter(v => !!v));

  projectAnalyticsSubscription: api.Subscription;
  selectedProjectAnalyticsSubscription$ = this.store
    .select(selectors.getSelectedProjectAnalyticsSubscription)
    .pipe(tap(x => (this.projectAnalyticsSubscription = x)));

  analyticsStateEnum = api.SubscriptionStateEnum;

  pageTitleSub: Subscription;

  displayedColumns = ['name', 'price', 'description', 'switch'];
  dataSource = new ExampleDataSource(this.store);

  selectedProjectUserIsAdmin$ = this.store.select(
    selectors.getSelectedProjectUserIsAdmin
  );

  constructor(
    private store: Store<interfaces.AppState>,
    private myDialogService: services.MyDialogService,
    @Inject(configs.APP_CONFIG) public appConfig: interfaces.AppConfig,
    private pageTitle: services.PageTitleService
  ) {
    this.pageTitleSub = this.pageTitle.setProjectSubtitle('Billing');
  }

  ngOnDestroy() {
    this.pageTitleSub.unsubscribe();
  }

  updateBillingAccount() {
    let projectId: string;
    this.store
      .select(selectors.getSelectedProjectId)
      .pipe(take(1))
      .subscribe(x => (projectId = x));

    let userId;
    this.store
      .select(selectors.getUserId)
      .pipe(take(1))
      .subscribe(x => (userId = x));

    Paddle.Checkout.open({
      product: 519436, // FREE plan
      email: userId,
      passthrough: {
        project_id: projectId,
        global_product: api.SubscriptionGlobalProductEnum.Analytics
      }
    });
  }

  openCancelSubscriptionDialog() {
    this.myDialogService.showCancelSubscriptionDialog();
  }

  openSwitchAnalyticsPlanDialog(targetPlanId: string) {
    this.myDialogService.showSwitchAnalyticsPlanDialog({
      target_plan_id: targetPlanId
    });
  }
}

/**
 * Data source to provide what data should be rendered in the table. The observable provided
 * in connect should emit exactly the data that should be rendered by the table. If the data is
 * altered, the observable should emit that new set of data on the stream. In our case here,
 * we return a stream that contains only one set of data that doesn't change.
 */
export class ExampleDataSource extends DataSource<any> {
  /** Connect function called by the table to retrieve one stream containing the data to render. */

  constructor(private store: Store<interfaces.AppState>) {
    super();
  }

  connect(): Observable<interfaces.AnalyticsPlan[]> {
    return this.store.select(selectors.getSelectedProjectAnalyticsPlans);
  }

  disconnect() {}
}
