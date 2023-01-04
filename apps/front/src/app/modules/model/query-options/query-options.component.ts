import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { tap } from 'rxjs/operators';
import { ModelQuery, ModelState } from '~front/app/queries/model.query';
import { NavigateService } from '~front/app/services/navigate.service';

@Component({
  selector: 'm-query-options',
  templateUrl: './query-options.component.html'
})
export class QueryOptionsComponent {
  @Input()
  showRunDryButton: boolean;

  @Output()
  runDryEvent = new EventEmitter();

  model: ModelState;
  model$ = this.modelQuery.select().pipe(
    tap(x => {
      this.model = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public modelQuery: ModelQuery,
    private navigateService: NavigateService,
    private cd: ChangeDetectorRef
  ) {}

  clearSelection(event?: MouseEvent) {
    event.stopPropagation();

    this.navigateService.navigateToModel(this.model.modelId);
  }

  runDry(event?: MouseEvent) {
    event.stopPropagation();

    this.runDryEvent.emit();
  }
}
