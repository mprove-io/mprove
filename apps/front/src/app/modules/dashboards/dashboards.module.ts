import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TreeModule } from '@circlon/angular-tree-component';
import { TippyModule } from '@ngneat/helipopper';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UiSwitchModule } from 'ngx-ui-switch';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
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
    TippyModule
  ]
})
export class DashboardsModule {}
