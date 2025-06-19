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

export interface ChartsReplaceColumnFieldDialogData {
  apiService: ApiService;
  chart: common.ChartX;
  fields: common.ModelField[];
  currentField: common.ModelField;
}

@Component({
  selector: 'm-charts-replace-column-field-dialog',
  templateUrl: './charts-replace-column-field-dialog.component.html',
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
export class ChartsReplaceColumnFieldDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  chart: common.ChartX;
  currentField: common.ModelField;
  fields: common.ModelField[];
  matchFields: common.ModelFieldY[];

  addFieldForm: FormGroup;

  isFieldAlreadySelected = false;
  newColumnFieldId: string;

  constructor(
    public ref: DialogRef<ChartsReplaceColumnFieldDialogData>,
    private fb: FormBuilder,
    private structService: StructService,
    private chartService: ChartService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.addFieldForm = this.fb.group({
      selectField: [undefined]
    });

    this.currentField = this.ref.data.currentField;

    this.fields = this.ref.data.fields;

    this.matchFields = this.fields
      .filter(x =>
        x.hidden === false &&
        x.fieldClass !== common.FieldClassEnum.Filter &&
        this.currentField.fieldClass === common.FieldClassEnum.Dimension
          ? x.fieldClass === common.FieldClassEnum.Dimension
          : x.fieldClass === common.FieldClassEnum.Measure ||
            x.fieldClass === common.FieldClassEnum.Calculation
      )
      .map(y =>
        Object.assign({}, y, {
          partLabel: common.isDefined(y.groupLabel)
            ? `${y.topLabel} ${y.groupLabel} ${y.label}`
            : `${y.topLabel} ${y.label}`
        } as common.ModelFieldY)
      )
      .sort((a, b) =>
        a.partLabel > b.partLabel ? 1 : b.partLabel > a.partLabel ? -1 : 0
      );

    this.chart = this.ref.data.chart;
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

    let newField = this.matchFields.find(y => y.id === this.newColumnFieldId);

    let newMconfig = this.structService.makeMconfig();

    if (newMconfig.modelType === common.ModelTypeEnum.Malloy) {
      let queryOperation: common.QueryOperation = {
        type: common.QueryOperationTypeEnum.Replace,
        fieldId: this.currentField.id,
        replaceWithFieldId: this.newColumnFieldId,
        timezone: newMconfig.timezone
      };

      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: queryOperation
      });
    } else {
      let index = newMconfig.select.indexOf(this.currentField.id);
      newMconfig.select.splice(index, 1, this.newColumnFieldId);

      newMconfig.sortings.forEach(sorting => {
        if (sorting.fieldId === this.currentField.id) {
          sorting.fieldId = this.newColumnFieldId;
        }
      });

      let newSorts: string[] = [];

      newMconfig.sortings.forEach(sorting =>
        sorting.desc === true
          ? newSorts.push(`${sorting.fieldId} desc`)
          : newSorts.push(sorting.fieldId)
      );

      newMconfig.sorts =
        newMconfig.sortings.length > 0 ? newSorts.join(', ') : null;

      newMconfig = common.setChartTitleOnSelectChange({
        mconfig: newMconfig,
        fields: this.fields
      });

      newMconfig = common.replaceChartField({
        mconfig: newMconfig,
        currentFieldId: this.currentField.id,
        newColumnFieldId: this.newColumnFieldId,
        newFieldResult: newField.result
      });

      newMconfig = common.setChartFields({
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
