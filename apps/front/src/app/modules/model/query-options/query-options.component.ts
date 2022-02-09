import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { tap } from 'rxjs/operators';
import { ModelQuery } from '~front/app/queries/model.query';
import { NavigateService } from '~front/app/services/navigate.service';
import { ModelState } from '~front/app/stores/model.store';

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
