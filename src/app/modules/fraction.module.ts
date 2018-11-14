import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DpDatePickerModule } from 'ng2-date-picker';
import * as components from 'app/components/_index';
import { MyMaterialModule } from 'app/modules/my-material.module';
import { SharedModule } from 'app/modules/shared.module';
import { ValidationMsgModule } from 'app/modules/validation-msg.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    MyMaterialModule,
    DpDatePickerModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ValidationMsgModule
  ],
  declarations: [
    components.FractionComponent,
    components.FractionNumberComponent,
    components.FractionStringComponent,
    components.FractionYesnoComponent,
    components.FractionDayOfWeekComponent,
    components.FractionDayOfWeekIndexComponent,
    components.FractionMonthNameComponent,
    components.FractionQuarterOfYearComponent,
    components.FractionTsComponent
  ],
  exports: [components.FractionComponent]
})
export class FractionModule {}
