import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TippyDirective } from '@ngneat/helipopper';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AgChartsModule } from 'ag-charts-angular';
import { MonacoEditorModule } from 'ng-monaco-editor';
import { ColorSketchModule } from 'ngx-color/sketch';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AvatarComponent } from './avatar/avatar.component';
import { BricksComponent } from './bricks/bricks.component';
import { ChartSaveAsDialogComponent } from './chart-save-as-dialog/chart-save-as-dialog.component';
import { ChartTableComponent } from './chart-table/chart-table.component';
import { ChartViewMetricsComponent } from './chart-view-metrics/chart-view-metrics.component';
import { ChartViewComponent } from './chart-view/chart-view.component';
import { ChartComponent } from './chart/chart.component';
import { ColorMenuComponent } from './color-menu/color-menu.component';
import { DashboardEditListenersDialogComponent } from './dashboard-edit-listeners-dialog/dashboard-edit-listeners-dialog.component';
import { DashboardSaveAsDialogComponent } from './dashboard-save-as-dialog/dashboard-save-as-dialog.component';
import { DashboardTileChartComponent } from './dashboard-tile-chart/dashboard-tile-chart.component';
import { FieldLabelComponent } from './field-label/field-label.component';
import { FormatNumberComponent } from './format-number/format-number.component';
import { FractionDayOfWeekIndexComponent } from './fraction/fraction-day-of-week-index/fraction-day-of-week-index.component';
import { FractionDayOfWeekComponent } from './fraction/fraction-day-of-week/fraction-day-of-week.component';
import { FractionMonthNameComponent } from './fraction/fraction-month-name/fraction-month-name.component';
import { FractionNumberComponent } from './fraction/fraction-number/fraction-number.component';
import { FractionQuarterOfYearComponent } from './fraction/fraction-quarter-of-year/fraction-quarter-of-year.component';
import { FractionStringComponent } from './fraction/fraction-string/fraction-string.component';
import { FractionTsComponent } from './fraction/fraction-ts/fraction-ts.component';
import { FractionYesnoComponent } from './fraction/fraction-yesno/fraction-yesno.component';
import { FractionComponent } from './fraction/fraction.component';
import { AddIconComponent } from './icons/add-icon/add-icon.component';
import { AdjustmentsIconComponent } from './icons/adjustments-icon/adjustments-icon.component';
import { ArrowDropDownIconComponent } from './icons/arrow-drop-down-icon/arrow-drop-down-icon.component';
import { ArrowLeftIconComponent } from './icons/arrow-left-icon/arrow-left-icon.component';
import { ArrowNarrowRightIconComponent } from './icons/arrow-narrow-right-icon/arrow-narrow-right-icon.component';
import { ArrowRightIconComponent } from './icons/arrow-right-icon/arrow-right-icon.component';
import { AscIconComponent } from './icons/asc-icon/asc-icon.component';
import { ChartIconComponent } from './icons/chart-icon/chart-icon.component';
import { ChartViewIconComponent } from './icons/chart-view-icon/chart-view-icon.component';
import { CheckIconComponent } from './icons/check-icon/check-icon.component';
import { ChevronDownIconComponent } from './icons/chevron-down-icon/chevron-down-icon.component';
import { ChevronLeftIconComponent } from './icons/chevron-left-icon/chevron-left-icon.component';
import { ChevronRightIconComponent } from './icons/chevron-right-icon/chevron-right-icon.component';
import { ChevronUpIconComponent } from './icons/chevron-up-icon/chevron-up-icon.component';
import { ClockIconComponent } from './icons/clock-icon/clock-icon.component';
import { CurrencyDollarIconComponent } from './icons/currency-dollar-icon/currency-dollar-icon.component';
import { DeleteIconComponent } from './icons/delete-icon/delete-icon.component';
import { DescIconComponent } from './icons/desc-icon/desc-icon.component';
import { DesktopIconComponent } from './icons/desktop-icon/desktop-icon.component';
import { DocumentIconComponent } from './icons/document-icon/document-icon.component';
import { DotsVerticalIconComponent } from './icons/dots-vertical-icon/dots-vertical-icon.component';
import { DragIconComponent } from './icons/drag-icon/drag-icon.component';
import { ExclamationIconComponent } from './icons/exclamation-icon/exclamation-icon.component';
import { FilterIconComponent } from './icons/filter-icon/filter-icon.component';
import { FolderClosedIconComponent } from './icons/folder-closed-icon/folder-closed-icon.component';
import { FolderOpenIconComponent } from './icons/folder-open-icon/folder-open-icon.component';
import { FormulaIconComponent } from './icons/formula-icon/formula-icon.component';
import { FullScreenIconComponent } from './icons/full-screen-icon/full-screen-icon.component';
import { InsightsIconComponent } from './icons/insights-icon/insights-icon.component';
import { LinkIconComponent } from './icons/link-icon/link-icon.component';
import { LinkOffIconComponent } from './icons/link-off-icon/link-off-icon.component';
import { LockClosedIconComponent } from './icons/lock-closed-icon/lock-closed-icon.component';
import { MenuBookIconComponent } from './icons/menu-book-icon/menu-book-icon.component';
import { MinusSmIconComponent } from './icons/minus-sm-icon/minus-sm-icon.component';
import { RefreshIconComponent } from './icons/refresh-icon/refresh-icon.component';
import { ResizeIconComponent } from './icons/resize-icon/resize-icon.component';
import { SaveIconComponent } from './icons/save-icon/save-icon.component';
import { SearchIconComponent } from './icons/search-icon/search-icon.component';
import { SettingsIconComponent } from './icons/settings-icon/settings-icon.component';
import { TableCellsIconComponent } from './icons/table-cells-icon/table-cells-icon.component';
import { TrashIconComponent } from './icons/trash-icon/trash-icon.component';
import { UserIconComponent } from './icons/user-icon/user-icon.component';
import { ViewGridIconComponent } from './icons/view-grid-icon/view-grid-icon.component';
import { ViewListIconComponent } from './icons/view-list-icon/view-list-icon.component';
import { WrenchIconComponent } from './icons/wrench-icon/wrench-icon.component';
import { LogoComponent } from './logo/logo.component';
import { MainTableComponent } from './main-table/main-table.component';
import { MetricFieldLabelComponent } from './metric-field-label/metric-field-label.component';
import { CapitalizeWordsPipe } from './pipes/capitalize-words.pipe';
import { CapitalizePipe } from './pipes/capitalize.pipe';
import { GoFromFileExtPipe } from './pipes/go-from-file-ext.pipe';
import { HideColumnsPipe } from './pipes/hide-columns.pipe';
import { MproveDirPipe } from './pipes/mprove-dir.pipe';
import { PrettyJsonPipe } from './pipes/pretty-json.pipe';
import { ResultPipe } from './pipes/result.pipe';
import { QueryStatusComponent } from './query-status/query-status.component';
import { ReportSaveAsDialogComponent } from './report-save-as-dialog/report-save-as-dialog.component';
import { AlertRingComponent } from './rings/alert-ring/alert-ring.component';
import { CompletedRingComponent } from './rings/completed-ring/completed-ring.component';
import { DocumentRingComponent } from './rings/document-ring/document-ring.component';
import { EmailRingComponent } from './rings/email-ring/email-ring.component';
import { SuggestFieldLabelComponent } from './suggest-field-label/suggest-field-label.component';
import { ValidationComponent } from './validation/validation.component';
import { ViewBlockmlDialogComponent } from './view-blockml-dialog/view-blockml-dialog.component';

let pipesArray = [
  GoFromFileExtPipe,
  CapitalizePipe,
  MproveDirPipe,
  CapitalizeWordsPipe,
  HideColumnsPipe,
  ResultPipe,
  PrettyJsonPipe
];

let sharedComponents = [
  LogoComponent,
  ValidationComponent,
  AvatarComponent,
  BricksComponent,
  MainTableComponent,
  //
  CompletedRingComponent,
  EmailRingComponent,
  DocumentRingComponent,
  AlertRingComponent,
  //
  SettingsIconComponent,
  DeleteIconComponent,
  TrashIconComponent,
  SaveIconComponent,
  CheckIconComponent,
  AddIconComponent,
  ChevronLeftIconComponent,
  ChevronRightIconComponent,
  ChevronUpIconComponent,
  ChevronDownIconComponent,
  FolderOpenIconComponent,
  FolderClosedIconComponent,
  DocumentIconComponent,
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
  ChartViewMetricsComponent,
  ChartComponent,
  DashboardTileChartComponent,
  FieldLabelComponent,
  MetricFieldLabelComponent,
  SuggestFieldLabelComponent,
  FormatNumberComponent,
  ColorMenuComponent,
  MinusSmIconComponent,
  QueryStatusComponent,
  FullScreenIconComponent,
  ChartViewIconComponent,
  DesktopIconComponent,
  SearchIconComponent,
  RefreshIconComponent,
  LockClosedIconComponent,
  ArrowDropDownIconComponent,
  DragIconComponent,
  ResizeIconComponent,
  ViewGridIconComponent,
  ViewListIconComponent,
  UserIconComponent,
  ChartIconComponent,
  WrenchIconComponent,
  AdjustmentsIconComponent,
  TableCellsIconComponent,
  InsightsIconComponent,
  MenuBookIconComponent,
  LinkIconComponent,
  LinkOffIconComponent,
  FormulaIconComponent,
  ClockIconComponent,
  ViewBlockmlDialogComponent,
  ReportSaveAsDialogComponent,
  ChartSaveAsDialogComponent,
  DashboardSaveAsDialogComponent,
  DashboardEditListenersDialogComponent
];

@NgModule({
  declarations: [...sharedComponents, ...pipesArray],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    NgxChartsModule,
    ColorSketchModule,
    NgxSpinnerModule,
    TippyDirective,
    MonacoEditorModule,
    AgChartsModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ],
  exports: [...sharedComponents, ...pipesArray],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule {}
