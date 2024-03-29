import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { KtdGridModule } from '@katoid/angular-grid-layout';
import { NgSelectModule } from '@ng-select/ng-select';
import { TippyModule } from '@ngneat/helipopper';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UiSwitchModule } from 'ngx-ui-switch';
import { SharedModule } from '../shared/shared.module';
import { DashboardFiltersComponent } from './dashboard-filters/dashboard-filters.component';
import { DashboardOptionsComponent } from './dashboard-options/dashboard-options.component';
import { DashboardComponent } from './dashboard.component';

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardFiltersComponent,
    DashboardOptionsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule,
    NgSelectModule,
    UiSwitchModule,
    NgxSpinnerModule,
    KtdGridModule,
    TippyModule
  ]
})
export class DashboardModule {}
