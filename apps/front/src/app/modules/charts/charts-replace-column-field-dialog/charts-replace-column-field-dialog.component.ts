import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
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

    if (newMconfig.chart.xField === this.currentField.id) {
      newMconfig.chart.xField = this.newColumnFieldId;
    }

    if (newMconfig.chart.multiField === this.currentField.id) {
      newMconfig.chart.multiField = this.newColumnFieldId;
    }

    if (newMconfig.chart.sizeField === this.currentField.id) {
      newMconfig.chart.sizeField =
        newField.result === common.FieldResultEnum.Number
          ? this.newColumnFieldId
          : undefined;
    }

    if (common.isDefined(newMconfig.chart.yFields)) {
      let yFieldsIndex = newMconfig.chart.yFields.indexOf(this.currentField.id);

      if (yFieldsIndex > -1) {
        if (newField.result === common.FieldResultEnum.Number) {
          newMconfig.chart.yFields.splice(
            yFieldsIndex,
            1,
            this.newColumnFieldId
          );
        } else {
          newMconfig.chart.yFields = newMconfig.chart.yFields.filter(
            yFieldId => yFieldId !== this.currentField.id
          );
        }
      }
    }

    if (common.isDefined(newMconfig.chart.hideColumns)) {
      let hideColumnsIndex = newMconfig.chart.hideColumns.indexOf(
        this.currentField.id
      );

      if (hideColumnsIndex > -1) {
        newMconfig.chart.hideColumns.splice(
          hideColumnsIndex,
          1,
          this.newColumnFieldId
        );
      }
    }

    if (common.isDefined(newMconfig.chart.series)) {
      let se = newMconfig.chart.series.find(
        x => x.dataField === this.currentField.id
      );

      if (common.isDefined(se)) {
        if (newField.result === common.FieldResultEnum.Number) {
          se.dataField = this.newColumnFieldId;
        } else {
          newMconfig.chart.series = newMconfig.chart.series.filter(
            s => s.dataField !== this.currentField.id
          );
        }
      }
    }

    newMconfig = common.setChartFields({
      mconfig: newMconfig,
      fields: this.fields
    });

    this.chartService.editChart({
      mconfig: newMconfig,
      isDraft: this.chart.draft,
      chartId: this.chart.chartId
    });

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
