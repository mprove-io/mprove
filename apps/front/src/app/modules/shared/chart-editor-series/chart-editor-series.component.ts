import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { TimeService } from '~front/app/services/time.service';
import { UiService } from '~front/app/services/ui.service';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import { ChartTypeItem } from '../../model/model.component';
import { ChartSeriesWithField } from '../chart-editor/chart-editor.component';

@Component({
  selector: 'm-chart-editor-series',
  templateUrl: './chart-editor-series.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartEditorSeriesEmtComponent implements OnChanges {
  @Input()
  seriesElement: ChartSeriesWithField;

  @Input()
  isReport: boolean;

  @Output() chartSeriesEmtUpdate =
    new EventEmitter<interfaces.EventChartSeriesEmtUpdate>();

  seriesTypesList: ChartTypeItem[] = [
    {
      label: 'Line',
      value: common.ChartTypeEnum.Line,
      iconPath: 'assets/charts/line.svg'
    },
    {
      label: 'Bar',
      value: common.ChartTypeEnum.Bar,
      iconPath: 'assets/charts/bar_vertical.svg'
    }
  ];

  seriesTypeForm: FormGroup = this.fb.group({
    seriesType: [undefined]
  });

  seriesIsExpanded = false;

  constructor(
    private fb: FormBuilder,
    private uiQuery: UiQuery,
    private uiService: UiService,
    private structQuery: StructQuery,
    private timeService: TimeService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    setValueAndMark({
      control: this.seriesTypeForm.controls['seriesType'],
      value: this.seriesElement.type
    });
  }

  toggleSeriesPanel(seriesId: string) {
    this.seriesIsExpanded = !this.seriesIsExpanded;
  }

  seriesTypeChange() {
    let seriesType = this.seriesTypeForm.controls['seriesType'].value;

    let newSeries: ChartSeriesWithField = Object.assign(
      {},
      this.seriesElement,
      { type: seriesType }
    );

    this.emitChartSeriesEmtUpdate({ series: newSeries });
  }

  emitChartSeriesEmtUpdate(item: { series: ChartSeriesWithField }) {
    let { series } = item;

    let event: interfaces.EventChartSeriesEmtUpdate = {
      series: series
    };

    this.chartSeriesEmtUpdate.emit(event);
  }
}
