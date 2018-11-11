import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as api from 'src/app/api/_index';
import * as interfaces from 'src/app/interfaces/_index';
import * as selectors from 'src/app/store/selectors/_index';

@Component({
  moduleId: module.id,
  selector: 'm-switch-analytics-plan-dialog',
  templateUrl: 'switch-analytics-plan-dialog.component.html'
})
export class SwitchAnalyticsPlanDialogComponent implements OnInit, OnDestroy {

  selectedProject: api.Project;
  selectedProjectSub: Subscription;

  toPlan: interfaces.AnalyticsPlan;

  constructor(
    public dialogRef: MatDialogRef<SwitchAnalyticsPlanDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private store: Store<interfaces.AppState>) {
  }

  ngOnInit(): void {
    this.selectedProjectSub = this.store.select(selectors.getSelectedProject)
      .pipe(filter(v => !!v))
      .subscribe(x => this.selectedProject = x);

    let plans: interfaces.AnalyticsPlan[];

    this.store.select(selectors.getSelectedProjectAnalyticsPlans).subscribe(x => plans = x);

    this.toPlan = plans.find(p => p.analytics_plan_id === this.data.target_plan_id);
  }

  ngOnDestroy() {
    this.selectedProjectSub.unsubscribe();
  }

  switchPlan() {
    this.store.dispatch(new actions.SwitchAnalyticsSubscriptionPlanAction({
      project_id: this.selectedProject.project_id,
      analytics_plan_id: this.data.target_plan_id,
    }));
  }
}
