import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import uFuzzy from '@leeoniya/ufuzzy';
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { TippyDirective } from '@ngneat/helipopper';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { QueryOperationTypeEnum } from '~common/enums/query-operation-type.enum';
import { isDefined } from '~common/functions/is-defined';
import { isDefinedAndNotEmpty } from '~common/functions/is-defined-and-not-empty';
import { isUndefined } from '~common/functions/is-undefined';
import { replaceChartField } from '~common/functions/replace-chart-field';
import { setChartFields } from '~common/functions/set-chart-fields';
import { setChartTitleOnSelectChange } from '~common/functions/set-chart-title-on-select-change';
import { ChartX } from '~common/interfaces/backend/chart-x';
import { ModelField } from '~common/interfaces/blockml/model-field';
import { ModelFieldY } from '~common/interfaces/blockml/model-field-y';
import { ApiService } from '~front/app/services/api.service';
import { ChartService } from '~front/app/services/chart.service';
import { StructService } from '~front/app/services/struct.service';
import { SharedModule } from '../../shared/shared.module';

export interface ChartsReplaceColumnFieldDialogData {
  apiService: ApiService;
  chart: ChartX;
  fields: ModelField[];
  currentField: ModelField;
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

  chart: ChartX;
  currentField: ModelField;
  fields: ModelField[];
  matchFields: ModelFieldY[];

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
        x.fieldClass !== FieldClassEnum.Filter &&
        this.currentField.fieldClass === FieldClassEnum.Dimension
          ? x.fieldClass === FieldClassEnum.Dimension
          : x.fieldClass === FieldClassEnum.Measure ||
            x.fieldClass === FieldClassEnum.Calculation
      )
      .map(y =>
        Object.assign({}, y, {
          partLabel: isDefined(y.groupLabel)
            ? `${y.topLabel} ${y.groupLabel} ${y.label}`
            : `${y.topLabel} ${y.label}`
        } as ModelFieldY)
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
    if (isUndefined(this.newColumnFieldId)) {
      return;
    }

    let newField = this.matchFields.find(y => y.id === this.newColumnFieldId);

    let newMconfig = this.structService.makeMconfig();

    if (newMconfig.modelType === ModelTypeEnum.Malloy) {
      this.chartService.editChart({
        mconfig: newMconfig,
        isDraft: this.chart.draft,
        chartId: this.chart.chartId,
        queryOperation: {
          type: QueryOperationTypeEnum.Replace,
          fieldId: this.currentField.id,
          replaceWithFieldId: this.newColumnFieldId,
          timezone: newMconfig.timezone
        }
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

      newMconfig = setChartTitleOnSelectChange({
        mconfig: newMconfig,
        fields: this.fields
      });

      newMconfig = replaceChartField({
        mconfig: newMconfig,
        currentFieldId: this.currentField.id,
        newColumnFieldId: this.newColumnFieldId,
        newFieldResult: newField.result
      });

      newMconfig = setChartFields({
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
