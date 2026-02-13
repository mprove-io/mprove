import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TippyDirective } from '@ngneat/helipopper';
import { ColorSketchModule } from 'ngx-color/sketch';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UiSwitchModule } from 'ngx-ui-switch';
import { FieldOptionsComponent } from '../models/model-tree/field-options/field-options.component';
import { MiniChartRendererComponent } from '../reports/report/mini-chart-renderer/mini-chart-renderer.component';
import { ReportAddRowDialogComponent } from '../reports/report-add-row-dialog/report-add-row-dialog.component';
import { AvatarComponent } from './avatar/avatar.component';
import { BricksComponent } from './bricks/bricks.component';
import { ChartBoxComponent } from './chart-box/chart-box.component';
import { ChartEditorComponent } from './chart-editor/chart-editor.component';
import { ChartEditorSeriesElementComponent } from './chart-editor-series-element/chart-editor-series-element.component';
import { ChartEditorYAxisElementComponent } from './chart-editor-y-axis-element/chart-editor-y-axis-element.component';
import { ChartSaveAsDialogComponent } from './chart-save-as-dialog/chart-save-as-dialog.component';
import { ChartSingleComponent } from './chart-single/chart-single.component';
import { ChartTableComponent } from './chart-table/chart-table.component';
import { ChartViewComponent } from './chart-view/chart-view.component';
import { ColorMenuComponent } from './color-menu/color-menu.component';
import { DashboardEditListenersDialogComponent } from './dashboard-edit-listeners-dialog/dashboard-edit-listeners-dialog.component';
import { DashboardSaveAsDialogComponent } from './dashboard-save-as-dialog/dashboard-save-as-dialog.component';
import { DashboardTileChartComponent } from './dashboard-tile-chart/dashboard-tile-chart.component';
import { FieldLabelComponent } from './field-label/field-label.component';
import { FieldResultComponent } from './field-result/field-result.component';
import { FormatNumberComponent } from './format-number/format-number.component';
import { FractionComponent } from './fraction/fraction.component';
import { FractionBooleanComponent } from './fraction/fraction-boolean/fraction-boolean.component';
import { FractionDayOfWeekComponent } from './fraction/fraction-day-of-week/fraction-day-of-week.component';
import { FractionDayOfWeekIndexComponent } from './fraction/fraction-day-of-week-index/fraction-day-of-week-index.component';
import { FractionMonthNameComponent } from './fraction/fraction-month-name/fraction-month-name.component';
import { FractionNumberComponent } from './fraction/fraction-number/fraction-number.component';
import { FractionQuarterOfYearComponent } from './fraction/fraction-quarter-of-year/fraction-quarter-of-year.component';
import { FractionStringComponent } from './fraction/fraction-string/fraction-string.component';
import { FractionTsComponent } from './fraction/fraction-ts/fraction-ts.component';
import { FractionYesnoComponent } from './fraction/fraction-yesno/fraction-yesno.component';
import { StoreFractionDatePickerComponent } from './fraction/store-fraction-date-picker/store-fraction-date-picker.component';
import { StoreFractionInputComponent } from './fraction/store-fraction-input/store-fraction-input.component';
import { StoreFractionSelectorComponent } from './fraction/store-fraction-selector/store-fraction-selector.component';
import { StoreFractionSubTypeComponent } from './fraction/store-fraction-sub-type/store-fraction-sub-type.component';
import { StoreFractionSwitchComponent } from './fraction/store-fraction-switch/store-fraction-switch.component';
import { ChartBarIconComponent } from './icons/1-chart-icons/chart-bar-icon/chart-bar-icon.component';
import { ChartIconComponent } from './icons/1-chart-icons/chart-icon/chart-icon.component';
import { ChartLineIconComponent } from './icons/1-chart-icons/chart-line-icon/chart-line-icon.component';
import { ChartPieIconComponent } from './icons/1-chart-icons/chart-pie-icon/chart-pie-icon.component';
import { ChartScatterIconComponent } from './icons/1-chart-icons/chart-scatter-icon/chart-scatter-icon.component';
import { ChartSingleIconComponent } from './icons/1-chart-icons/chart-single-icon/chart-single-icon.component';
import { ChartTableIconComponent } from './icons/1-chart-icons/chart-table-icon/chart-table-icon.component';
import { ChartZoomIconComponent } from './icons/1-chart-icons/chart-zoom-icon/chart-zoom-icon.component';
import { TypeCustomIconComponent } from './icons/2-type-icons/type-custom-icon/type-custom-icon.component';
import { TypeDateIconComponent } from './icons/2-type-icons/type-date-icon/type-date-icon.component';
import { TypeEnumIconComponent } from './icons/2-type-icons/type-enum-icon/type-enum-icon.component';
import { TypeFilterIconComponent } from './icons/2-type-icons/type-filter-icon/type-filter-icon.component';
import { TypeNumberIconComponent } from './icons/2-type-icons/type-number-icon/type-number-icon.component';
import { TypeOnOffIconComponent } from './icons/2-type-icons/type-on-off-icon/type-on-off-icon.component';
import { TypeStringIconComponent } from './icons/2-type-icons/type-string-icon/type-string-icon.component';
import { AddIconComponent } from './icons/add-icon/add-icon.component';
import { AdjustmentsIconComponent } from './icons/adjustments-icon/adjustments-icon.component';
import { ArrowDropDownIconComponent } from './icons/arrow-drop-down-icon/arrow-drop-down-icon.component';
import { ArrowLeftIconComponent } from './icons/arrow-left-icon/arrow-left-icon.component';
import { ArrowNarrowRightIconComponent } from './icons/arrow-narrow-right-icon/arrow-narrow-right-icon.component';
import { ArrowRightIconComponent } from './icons/arrow-right-icon/arrow-right-icon.component';
import { ArrowUpIconComponent } from './icons/arrow-up-icon/arrow-up-icon.component';
import { AscIconComponent } from './icons/asc-icon/asc-icon.component';
import { BottomPanelIconComponent } from './icons/bottom-panel-icon/bottom-panel-icon.component';
import { CheckIconComponent } from './icons/check-icon/check-icon.component';
import { ChevronDownIconComponent } from './icons/chevron-down-icon/chevron-down-icon.component';
import { ChevronLeftIconComponent } from './icons/chevron-left-icon/chevron-left-icon.component';
import { ChevronRightIconComponent } from './icons/chevron-right-icon/chevron-right-icon.component';
import { ChevronUpIconComponent } from './icons/chevron-up-icon/chevron-up-icon.component';
import { ClockIconComponent } from './icons/clock-icon/clock-icon.component';
import { CurrencyDollarIconComponent } from './icons/currency-dollar-icon/currency-dollar-icon.component';
import { DeleteBigIconComponent } from './icons/delete-big-icon/delete-big-icon.component';
import { DeleteIconComponent } from './icons/delete-icon/delete-icon.component';
import { DescIconComponent } from './icons/desc-icon/desc-icon.component';
import { DesktopIconComponent } from './icons/desktop-icon/desktop-icon.component';
import { DocumentIconComponent } from './icons/document-icon/document-icon.component';
import { DotsVerticalIconComponent } from './icons/dots-vertical-icon/dots-vertical-icon.component';
import { DragIconComponent } from './icons/drag-icon/drag-icon.component';
import { EditIconComponent } from './icons/edit-icon/edit-icon.component';
import { ExclamationIconComponent } from './icons/exclamation-icon/exclamation-icon.component';
import { FilterIconComponent } from './icons/filter-icon/filter-icon.component';
import { FolderClosedIconComponent } from './icons/folder-closed-icon/folder-closed-icon.component';
import { FolderOpenIconComponent } from './icons/folder-open-icon/folder-open-icon.component';
import { FormulaIconComponent } from './icons/formula-icon/formula-icon.component';
import { FullScreenIconComponent } from './icons/full-screen-icon/full-screen-icon.component';
import { LeftPanelIconComponent } from './icons/left-panel-icon/left-panel-icon.component';
import { LinkIconComponent } from './icons/link-icon/link-icon.component';
import { LinkOffIconComponent } from './icons/link-off-icon/link-off-icon.component';
import { LockClosedIconComponent } from './icons/lock-closed-icon/lock-closed-icon.component';
import { MagGlassIconComponent } from './icons/mag-glass-icon/mag-glass-icon.component';
import { MiniChartsIconComponent } from './icons/mini-charts-icon/mini-charts-icon.component';
import { MinusSmIconComponent } from './icons/minus-sm-icon/minus-sm-icon.component';
import { RefreshIconComponent } from './icons/refresh-icon/refresh-icon.component';
import { ResizeIconComponent } from './icons/resize-icon/resize-icon.component';
import { RightPanelIconComponent } from './icons/right-panel-icon/right-panel-icon.component';
import { SaveIconComponent } from './icons/save-icon/save-icon.component';
import { SearchIconComponent } from './icons/search-icon/search-icon.component';
import { SettingsIconComponent } from './icons/settings-icon/settings-icon.component';
import { TableCellsIconComponent } from './icons/table-cells-icon/table-cells-icon.component';
import { TrashIconComponent } from './icons/trash-icon/trash-icon.component';
import { TreeIconComponent } from './icons/tree-icon/tree-icon.component';
import { TreeStructureIconComponent } from './icons/tree-structure-icon/tree-structure-icon.component';
import { UnfoldLessIconComponent } from './icons/unfold-less-icon/unfold-less-icon.component';
import { UnfoldMoreIconComponent } from './icons/unfold-more-icon/unfold-more-icon.component';
import { UserIconComponent } from './icons/user-icon/user-icon.component';
import { ViewGridIconComponent } from './icons/view-grid-icon/view-grid-icon.component';
import { ViewListIconComponent } from './icons/view-list-icon/view-list-icon.component';
import { WrenchIconComponent } from './icons/wrench-icon/wrench-icon.component';
import { LogoComponent } from './logo/logo.component';
import { MainTableComponent } from './main-table/main-table.component';
import { MetricFieldLabelComponent } from './metric-field-label/metric-field-label.component';
import { CapitalizePipe } from './pipes/capitalize.pipe';
import { CapitalizeDowPipe } from './pipes/capitalize-dow.pipe';
import { CapitalizeWordsPipe } from './pipes/capitalize-words.pipe';
import { FixNgSelectDirective } from './pipes/fix-ng-select.directive';
import { GoFromFileExtPipe } from './pipes/go-from-file-ext.pipe';
import { HideColumnsPipe } from './pipes/hide-columns.pipe';
import { MproveDirPipe } from './pipes/mprove-dir.pipe';
import { PrettyJsonPipe } from './pipes/pretty-json.pipe';
import { ResultPipe } from './pipes/result.pipe';
import { QueryStatusComponent } from './query-status/query-status.component';
import { ReportEditListenersDialogComponent } from './report-edit-listeners-dialog/report-edit-listeners-dialog.component';
import { ReportSaveAsDialogComponent } from './report-save-as-dialog/report-save-as-dialog.component';
import { AlertRingComponent } from './rings/alert-ring/alert-ring.component';
import { CompletedRingComponent } from './rings/completed-ring/completed-ring.component';
import { DocumentRingComponent } from './rings/document-ring/document-ring.component';
import { EmailRingComponent } from './rings/email-ring/email-ring.component';
import { RowMetricLabelComponent } from './row-metric-label/row-metric-label.component';
import { SuggestFieldLabelComponent } from './suggest-field-label/suggest-field-label.component';
import { ValidationComponent } from './validation/validation.component';

let pipesArray = [
  GoFromFileExtPipe,
  CapitalizePipe,
  CapitalizeWordsPipe,
  CapitalizeDowPipe,
  MproveDirPipe,
  HideColumnsPipe,
  ResultPipe,
  PrettyJsonPipe
];

let directivesArray = [FixNgSelectDirective];

let sharedComponents = [
  LogoComponent,
  ValidationComponent,
  AvatarComponent,
  BricksComponent,
  MainTableComponent,
  FieldOptionsComponent,
  //
  CompletedRingComponent,
  EmailRingComponent,
  DocumentRingComponent,
  AlertRingComponent,
  //
  SettingsIconComponent,
  DeleteIconComponent,
  DeleteBigIconComponent,
  EditIconComponent,
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
  ArrowUpIconComponent,
  DescIconComponent,
  AscIconComponent,
  CurrencyDollarIconComponent,
  FilterIconComponent,
  TreeStructureIconComponent,
  MagGlassIconComponent,
  FractionComponent,
  StoreFractionSubTypeComponent,
  StoreFractionSelectorComponent,
  StoreFractionInputComponent,
  StoreFractionSwitchComponent,
  StoreFractionDatePickerComponent,
  FractionStringComponent,
  FractionNumberComponent,
  FractionBooleanComponent,
  FractionYesnoComponent,
  FractionMonthNameComponent,
  FractionDayOfWeekComponent,
  FractionQuarterOfYearComponent,
  FractionDayOfWeekIndexComponent,
  FractionTsComponent,
  ChartTableComponent,
  ChartSingleComponent,
  ChartViewComponent,
  ChartBoxComponent,
  DashboardTileChartComponent,
  MiniChartRendererComponent,
  FieldLabelComponent,
  FieldResultComponent,
  MetricFieldLabelComponent,
  SuggestFieldLabelComponent,
  FormatNumberComponent,
  ColorMenuComponent,
  MinusSmIconComponent,
  QueryStatusComponent,
  FullScreenIconComponent,
  ChartZoomIconComponent,
  DesktopIconComponent,
  SearchIconComponent,
  RefreshIconComponent,
  LockClosedIconComponent,
  ArrowDropDownIconComponent,
  DragIconComponent,
  ResizeIconComponent,
  ViewGridIconComponent,
  TreeIconComponent,
  ViewListIconComponent,
  UserIconComponent,
  ChartIconComponent,
  WrenchIconComponent,
  AdjustmentsIconComponent,
  TableCellsIconComponent,
  MiniChartsIconComponent,
  TypeNumberIconComponent,
  TypeStringIconComponent,
  TypeCustomIconComponent,
  TypeFilterIconComponent,
  TypeOnOffIconComponent,
  TypeDateIconComponent,
  TypeEnumIconComponent,
  ChartTableIconComponent,
  ChartLineIconComponent,
  ChartBarIconComponent,
  ChartScatterIconComponent,
  ChartPieIconComponent,
  ChartSingleIconComponent,
  LeftPanelIconComponent,
  RightPanelIconComponent,
  UnfoldMoreIconComponent,
  UnfoldLessIconComponent,
  BottomPanelIconComponent,
  LinkIconComponent,
  LinkOffIconComponent,
  FormulaIconComponent,
  ClockIconComponent,
  ReportSaveAsDialogComponent,
  ChartSaveAsDialogComponent,
  DashboardSaveAsDialogComponent,
  ReportAddRowDialogComponent,
  DashboardEditListenersDialogComponent,
  ReportEditListenersDialogComponent,
  ChartEditorComponent,
  ChartEditorSeriesElementComponent,
  ChartEditorYAxisElementComponent,
  RowMetricLabelComponent
];

@NgModule({
  declarations: [...sharedComponents, ...pipesArray, ...directivesArray],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DragDropModule,
    NgSelectModule,
    ColorSketchModule,
    NgxSpinnerModule,
    TippyDirective,
    UiSwitchModule,
    NgScrollbarModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    })
  ],
  exports: [...sharedComponents, ...pipesArray, ...directivesArray],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule {}
