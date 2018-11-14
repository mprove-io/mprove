import { Component, Input } from '@angular/core';
import * as api from 'app/api/_index';
import * as interfaces from 'app/interfaces/_index';

@Component({
  moduleId: module.id,
  selector: 'm-chart-viewer',
  templateUrl: 'chart-viewer.component.html',
  styleUrls: ['chart-viewer.component.scss']
})
export class ChartViewerComponent {
  tileWidthEnum = api.ChartTileWidthEnum;

  @Input() visual: interfaces.Visual;

  @Input() backgroundColor: string;

  constructor() {}
}
