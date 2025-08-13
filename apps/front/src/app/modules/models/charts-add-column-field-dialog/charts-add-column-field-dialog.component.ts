import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ApiService } from '~front/app/services/api.service';
import { common } from '~front/barrels/common';
import { SharedModule } from '../../shared/shared.module';

import uFuzzy from '@leeoniya/ufuzzy';
import { TippyDirective } from '@ngneat/helipopper';
import { ChartService } from '~front/app/services/chart.service';
import { StructService } from '~front/app/services/struct.service';

export interface ChartsAddColumnFieldDialogData {
  apiService: ApiService;
  chart: common.ChartX;
  fields: common.ModelFieldY[];
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

  chart: common.ChartX;
  fields: common.ModelFieldY[];
  matchFields: common.ModelField[];

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
      .filter(
        x => x.hidden === false && x.fieldClass !== common.FieldClassEnum.Filter
      )
      .sort((a, b) =>
        a.fieldClass !== common.FieldClassEnum.Dimension &&
        b.fieldClass === common.FieldClassEnum.Dimension
          ? -1
          : a.fieldClass === common.FieldClassEnum.Dimension &&
              b.fieldClass !== common.FieldClassEnum.Dimension
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
    if (common.isUndefined(this.newColumnFieldId)) {
      return;
    }

    let newMconfig = this.structService.makeMconfig();

    if (newMconfig.modelType === common.ModelTypeEnum.Malloy) {
      let { queryOperationType, sortFieldId, desc } =
        common.sortFieldsOnSelectChange({
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

      newMconfig = common.setChartTitleOnSelectChange({
        mconfig: newMconfig,
        fields: this.fields
      });

      newMconfig = common.setChartFields({
        mconfig: newMconfig,
        fields: this.fields
      });

      newMconfig = common.sortChartFieldsOnSelectChange({
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

  searchFn(term: string, modelField: common.ModelField) {
    let haystack = [
      common.isDefinedAndNotEmpty(modelField.groupLabel)
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
