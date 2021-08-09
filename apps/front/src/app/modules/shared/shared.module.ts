import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MonacoEditorModule } from '@sentinel-one/ngx-monaco-editor';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { ColorSketchModule } from 'ngx-color/sketch';
import { AvatarComponent } from './avatar/avatar.component';
import { ChartTableComponent } from './chart-table/chart-table.component';
import { ChartViewComponent } from './chart-view/chart-view.component';
import { ChartVizComponent } from './chart-viz/chart-viz.component';
import { ChartWrapperComponent } from './chart-wrapper/chart-wrapper.component';
import { ColorMenuComponent } from './color-menu/color-menu.component';
import { FieldLabelComponent } from './field-label/field-label.component';
import { FractionDayOfWeekIndexComponent } from './fraction/fraction-day-of-week-index/fraction-day-of-week-index.component';
import { FractionDayOfWeekComponent } from './fraction/fraction-day-of-week/fraction-day-of-week.component';
import { FractionMonthNameComponent } from './fraction/fraction-month-name/fraction-month-name.component';
import { FractionNumberComponent } from './fraction/fraction-number/fraction-number.component';
import { FractionQuarterOfYearComponent } from './fraction/fraction-quarter-of-year/fraction-quarter-of-year.component';
import { FractionStringComponent } from './fraction/fraction-string/fraction-string.component';
import { FractionTsComponent } from './fraction/fraction-ts/fraction-ts.component';
import { FractionYesnoComponent } from './fraction/fraction-yesno/fraction-yesno.component';
import { FractionComponent } from './fraction/fraction.component';
import { AddIconComponent } from './icons/add-icon /add-icon.component';
import { ArrowLeftIconComponent } from './icons/arrow-left-icon/arrow-left-icon.component';
import { ArrowNarrowRightIconComponent } from './icons/arrow-narrow-right-icon/arrow-narrow-right-icon.component';
import { ArrowRightIconComponent } from './icons/arrow-right-icon/arrow-right-icon.component';
import { AscIconComponent } from './icons/asc-icon/asc-icon.component';
import { CheckIconComponent } from './icons/check-icon/check-icon.component';
import { ChevronDownIconComponent } from './icons/chevron-down-icon/chevron-down-icon.component';
import { ChevronLeftIconComponent } from './icons/chevron-left-icon/chevron-left-icon.component';
import { ChevronRightIconComponent } from './icons/chevron-right-icon/chevron-right-icon.component';
import { ChevronUpIconComponent } from './icons/chevron-up-icon/chevron-up-icon.component';
import { CurrencyDollarIconComponent } from './icons/currency-dollar-icon/currency-dollar-icon.component';
import { DeleteIconComponent } from './icons/delete-icon/delete-icon.component';
import { DescIconComponent } from './icons/desc-icon/desc-icon.component';
import { DotsVerticalIconComponent } from './icons/dots-vertical-icon/dots-vertical-icon.component';
import { ExclamationIconComponent } from './icons/exclamation-icon/exclamation-icon.component';
import { FilterIconComponent } from './icons/filter-icon/filter-icon.component';
import { FolderClosedIconComponent } from './icons/folder-closed-icon/folder-closed-icon.component';
import { FolderOpenIconComponent } from './icons/folder-open-icon/folder-open-icon.component';
import { MinusSmIconComponent } from './icons/minus-sm-icon/minus-sm-icon.component';
import { SettingsIconComponent } from './icons/settings-icon/settings-icon.component';
import { LogoComponent } from './logo/logo.component';
import { CapitalizePipe } from './pipes/capitalize.pipe';
import { ExtensionPipe } from './pipes/extension.pipe';
import { HideColumnsPipe } from './pipes/hide-columns.pipe';
import { ResultPipe } from './pipes/result.pipe';
import { CompletedRingComponent } from './rings/completed-ring/completed-ring.component';
import { DocumentRingComponent } from './rings/document-ring/document-ring.component';
import { EmailRingComponent } from './rings/email-ring/email-ring.component';
import { ValidationComponent } from './validation/validation.component';

let pipesArray = [ExtensionPipe, CapitalizePipe, HideColumnsPipe, ResultPipe];

let sharedComponents = [
  LogoComponent,
  ValidationComponent,
  AvatarComponent,
  //
  CompletedRingComponent,
  EmailRingComponent,
  DocumentRingComponent,
  //
  SettingsIconComponent,
  DeleteIconComponent,
  CheckIconComponent,
  AddIconComponent,
  ChevronLeftIconComponent,
  ChevronRightIconComponent,
  ChevronUpIconComponent,
  ChevronDownIconComponent,
  FolderOpenIconComponent,
  FolderClosedIconComponent,
  DotsVerticalIconComponent,
  ExclamationIconComponent,
  ArrowNarrowRightIconComponent,
  ArrowLeftIconComponent,
  ArrowRightIconComponent,
  DescIconComponent,
  AscIconComponent,
  CurrencyDollarIconComponent,
  FilterIconComponent,
  FractionComponent,
  FractionStringComponent,
  FractionNumberComponent,
  FractionYesnoComponent,
  FractionMonthNameComponent,
  FractionDayOfWeekComponent,
  FractionQuarterOfYearComponent,
  FractionDayOfWeekIndexComponent,
  FractionTsComponent,
  ChartTableComponent,
  ChartViewComponent,
  ChartWrapperComponent,
  ChartVizComponent,
  FieldLabelComponent,
  ColorMenuComponent,
  MinusSmIconComponent
];

@NgModule({
  declarations: [...sharedComponents, ...pipesArray],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MonacoEditorModule.forRoot(),
    FormsModule,
    NgSelectModule,
    NzDatePickerModule,
    NzTimePickerModule,
    NgxChartsModule,
    ColorSketchModule
  ],
  exports: [...sharedComponents, ...pipesArray, MonacoEditorModule]
})
export class SharedModule {}
