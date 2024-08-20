import { TreeModule } from '@ali-hm/angular-tree-component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VirtualScrollerModule } from '@iharbeck/ngx-virtual-scroller';
import { TippyDirective } from '@ngneat/helipopper';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UiSwitchModule } from 'ngx-ui-switch';
import { SharedModule } from '../shared/shared.module';
import { DashboardsComponent } from './dashboards.component';

@NgModule({
  declarations: [DashboardsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule,
    TreeModule,
    VirtualScrollerModule,
    UiSwitchModule,
    NgxSpinnerModule,
    TippyDirective
  ]
})
export class DashboardsModule {}
