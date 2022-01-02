import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { KtdGridModule } from '@katoid/angular-grid-layout';
import { NgSelectModule } from '@ng-select/ng-select';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UiSwitchModule } from 'ngx-ui-switch';
import { SharedModule } from '../shared/shared.module';
import { DashboardFiltersComponent } from './dashboard-filters/dashboard-filters.component';
import { DashboardComponent } from './dashboard.component';

@NgModule({
  declarations: [DashboardComponent, DashboardFiltersComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule,
    NgSelectModule,
    NzToolTipModule,
    UiSwitchModule,
    NgxSpinnerModule,
    KtdGridModule
  ]
})
export class DashboardModule {}
