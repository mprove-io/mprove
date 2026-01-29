import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import uFuzzy from '@leeoniya/ufuzzy';
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { TippyDirective } from '@ngneat/helipopper';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { isUndefined } from '#common/functions/is-undefined';
import { setChartFields } from '#common/functions/set-chart-fields';
import { setChartTitleOnSelectChange } from '#common/functions/set-chart-title-on-select-change';
import { sortChartFieldsOnSelectChange } from '#common/functions/sort-chart-fields-on-select-change';
import { sortFieldsOnSelectChange } from '#common/functions/sort-fields-on-select-change';
import { ChartX } from '#common/interfaces/backend/chart-x';
import { ModelField } from '#common/interfaces/blockml/model-field';
import { ModelFieldY } from '#common/interfaces/blockml/model-field-y';
import { ApiService } from '#front/app/services/api.service';
import { ChartService } from '#front/app/services/chart.service';
import { StructService } from '#front/app/services/struct.service';
import { SharedModule } from '../../shared/shared.module';

export interface ChartsAddColumnFieldDialogData {
  apiService: ApiService;
  chart: ChartX;
  fields: ModelFieldY[];
}

@Component({
  selector: 'm-charts-add-column-field-dialog',
  templateUrl: './charts-add-column-field-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    SharedModule,
    TippyDirective,
    NgxSpinnerModule
  ]
})
export class ChartsAddColumnFieldDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  chart: ChartX;
  fields: ModelFieldY[];
  matchFields: ModelField[];

  addFieldForm: FormGroup;

  isFieldAlreadySelected = false;
  newColumnFieldId: string;

  constructor(
    public ref: DialogRef<ChartsAddColumnFieldDialogData>,
    private fb: FormBuilder,
    private structService: StructService,
    private chartService: ChartService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.addFieldForm = this.fb.group({
      selectField: [undefined]
    });

    this.chart = this.ref.data.chart;

    this.fields = this.ref.data.fields;

    this.matchFields = this.fields
      .filter(x => x.hidden === false && x.fieldClass !== FieldClassEnum.Filter)
      .sort((a, b) =>
        a.fieldClass !== FieldClassEnum.Dimension &&
        b.fieldClass === FieldClassEnum.Dimension
          ? -1
          : a.fieldClass === FieldClassEnum.Dimension &&
              b.fieldClass !== FieldClassEnum.Dimension
            ? 1
            : 0
      );
  }

  selectFieldChange() {
    (document.activeElement as HTMLElement).blur();

    this.isFieldAlreadySelected =
      this.chart.tiles[0].mconfig.select.indexOf(this.newColumnFieldId) > -1;
  }

  save() {
    if (isUndefined(this.newColumnFieldId)) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();

    if (newMconfig.modelType === ModelTypeEnum.Malloy) {
      let { queryOperationType, sortFieldId, desc } = sortFieldsOnSelectChange({
        mconfig: newMconfig,
        selectFieldId: this.newColumnFieldId,
        modelFields: this.fields,
        mconfigFields: newMconfig.fields
      });

      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: queryOperationType,
          fieldId: this.newColumnFieldId,
          sortFieldId: sortFieldId,
          desc: desc,
          timezone: newMconfig.timezone
        }
      });
    } else {
      newMconfig.select = [...newMconfig.select, this.newColumnFieldId];

      newMconfig = setChartTitleOnSelectChange({
        mconfig: newMconfig,
        fields: this.fields
      });

      newMconfig = setChartFields({
        mconfig: newMconfig,
        fields: this.fields
      });

      newMconfig = sortChartFieldsOnSelectChange({
        mconfig: newMconfig,
        fields: this.fields
      });

      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId
      });
    }

    this.ref.close();
  }

  searchFn(term: string, modelField: ModelField) {
    let haystack = [
      isDefinedAndNotEmpty(modelField.groupLabel)
        ? `${modelField.topLabel} ${modelField.groupLabel} - ${modelField.label}`
        : `${modelField.topLabel} ${modelField.label}`
    ];

    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);

    return idxs != null && idxs.length > 0;
  }

  cancel() {
    this.ref.close();
  }
}
