import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TreeModule } from '@bugsplat/angular-tree-component';
import { VirtualScrollerModule } from '@iharbeck/ngx-virtual-scroller';
import { TippyModule } from '@ngneat/helipopper';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UiSwitchModule } from 'ngx-ui-switch';
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
    NgxSpinnerModule,
    TippyModule
  ]
})
export class VisualizationsModule {}
