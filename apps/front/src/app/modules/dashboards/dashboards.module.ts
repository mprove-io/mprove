import { TreeModule } from '@ali-hm/angular-tree-component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { KtdGridModule } from '@katoid/angular-grid-layout';
import { NgSelectModule } from '@ng-select/ng-select';
import { TippyDirective } from '@ngneat/helipopper';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UiSwitchModule } from 'ngx-ui-switch';
import { SharedModule } from '../shared/shared.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardFiltersComponent } from './dashboard-filters/dashboard-filters.component';
import { DashboardOptionsComponent } from './dashboard-options/dashboard-options.component';
import { DashboardsComponent } from './dashboards.component';
import { DashboardsListComponent } from './dashboards-list/dashboards-list.component';

@NgModule({
  declarations: [
    DashboardsComponent,
    DashboardsListComponent,
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
    TreeModule,
    UiSwitchModule,
    NgxSpinnerModule,
    TippyDirective,
    NgSelectModule,
    KtdGridModule,
    NgScrollbarModule
  ]
})
export class DashboardsModule {}
