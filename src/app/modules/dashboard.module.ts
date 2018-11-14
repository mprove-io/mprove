import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import * as components from 'app/components/_index';
import { FractionModule } from 'app/modules/fraction.module';
import { MyCovalentModule } from 'app/modules/my-covalent.module';
import { MyMaterialModule } from 'app/modules/my-material.module';
import { SharedModule } from 'app/modules/shared.module';
import { VisualModule } from 'app/modules/visual.module';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FractionModule,
    MyMaterialModule,
    MyCovalentModule,
    FlexLayoutModule,
    RouterModule,
    ReactiveFormsModule,
    VisualModule
  ],
  declarations: [
    components.DashboardComponent,
    components.DashboardFiltersComponent,
    components.ReportTitleComponent
  ],
  entryComponents: [],
  exports: [components.DashboardComponent]
})
export class DashboardModule {}
