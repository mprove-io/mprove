import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TreeModule } from '@circlon/angular-tree-component';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UiSwitchModule } from 'ngx-ui-switch';
import { VirtualScrollerModule } from 'ngx-virtual-scroller';
import { SharedModule } from '../shared/shared.module';
import { VisualizationsComponent } from './visualizations.component';

@NgModule({
  declarations: [VisualizationsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule,
    TreeModule,
    VirtualScrollerModule,
    UiSwitchModule,
    NzToolTipModule,
    NgxSpinnerModule
  ]
})
export class VisualizationsModule {}
