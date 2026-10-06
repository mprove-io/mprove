import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  type FormControl,
  type FormGroup,
  Validators
} from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  Subscription,
  switchMap,
  take
} from 'rxjs';
import { MyRegex } from '#common/classes/my-regex/my-regex';
import { MALLOY_FILTER_ANY } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import { unwrapBackendResponseOutput } from '#common/functions/unwrap-backend-response-output/unwrap-backend-response-output';
import type { ToBackendSuggestDimensionValuesOutput } from '#common/types/backend/routes/mconfigs/suggest-dimension-values/suggest-dimension-values-output';
import type { ToBackendSuggestDimensionValuesRequest } from '#common/types/backend/routes/mconfigs/suggest-dimension-values/suggest-dimension-values-request';
import type { ToBackendSuggestDimensionValuesResponse } from '#common/types/backend/routes/mconfigs/suggest-dimension-values/suggest-dimension-values-response';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { FractionOperator } from '#common/types/blockml/parts/fraction/fraction-operator';
import type { EventFractionUpdate } from '#common/types/front/fraction/event-fraction-update';
import { NavQuery } from '#front/app/queries/nav.query';
import { ApiService } from '#front/app/services/api.service';
import { FractionTypeItem } from '../fraction.component';

@Component({
  standalone: false,
  selector: 'm-fraction-string',
  templateUrl: 'fraction-string.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionStringComponent implements OnInit, OnDestroy {
  readonly fractionOperatorAnd: FractionOperator = 'And';

  @ViewChild('fractionStringTypeSelect', { static: false })
  fractionStringTypeSelectElement: NgSelectComponent;

  @ViewChild('stringValueSelect', { static: false })
  stringValueSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.fractionStringTypeSelectElement?.close();
    this.stringValueSelectElement?.close();
  }

  defaultStringValue = 'abc';

  @Input() suggestModelDimension: string;
  @Input() structId: string;
  @Input() chartId: string;
  @Input() dashboardId: string;
  @Input() reportId: string;
  @Input() rowId: string;

  @Input() isDisabled: boolean;
  @Input() fraction: Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  fractionForm: FormGroup<{
    stringValue: FormControl<string>;
  }>;

  fractionStringTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: 'StringIsAnyValue',
      operator: 'Or'
    },
    {
      label: 'is equal to',
      value: 'StringIsEqualTo',
      operator: 'Or'
    },
    {
      label: 'starts with',
      value: 'StringStartsWith',
      operator: 'Or'
    },
    {
      label: 'ends with',
      value: 'StringEndsWith',
      operator: 'Or'
    },
    {
      label: 'contains',
      value: 'StringContains',
      operator: 'Or'
    },
    {
      label: 'matches',
      value: 'StringIsLike',
      operator: 'Or'
    },
    {
      label: 'is null',
      value: 'StringIsNull',
      operator: 'Or'
    },
    {
      label: 'is empty',
      value: 'StringIsEmpty',
      operator: 'Or'
    },
    {
      label: 'is not equal to',
      value: 'StringIsNotEqualTo',
      operator: 'And'
    },
    {
      label: 'does not start with',
      value: 'StringDoesNotStartWith',
      operator: 'And'
    },
    {
      label: 'does not end with',
      value: 'StringDoesNotEndWith',
      operator: 'And'
    },
    {
      label: 'does not contain',
      value: 'StringDoesNotContain',
      operator: 'And'
    },
    {
      label: 'does not match',
      value: 'StringIsNotLike',
      operator: 'And'
    },
    {
      label: 'is not null',
      value: 'StringIsNotNull',
      operator: 'And'
    },
    {
      label: 'is not empty',
      value: 'StringIsNotEmpty',
      operator: 'And'
    }
  ];

  loading = false;
  items: any[] = [];
  searchInput$ = new BehaviorSubject<string>('');

  searchValue: string;

  searchSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private navQuery: NavQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.buildFractionForm();
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onCloseSelect() {
    this.searchValue = '';
    this.items = [];

    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onOpenSelect() {
    if (
      isDefined(this.suggestModelDimension) &&
      (this.fraction.type === 'StringIsEqualTo' ||
        this.fraction.type === 'StringIsNotEqualTo')
    ) {
      let reg = MyRegex.CAPTURE_SUGGEST_MODEL_FIELD_G();

      let r = reg.exec(this.suggestModelDimension);

      let modelId = r[1];
      let fieldId = r[2];

      this.searchSubscription = this.searchInput$
        .pipe(
          debounceTime(300), // Wait 300 ms after user stops typing
          distinctUntilChanged(), // Only trigger if the input has changed
          switchMap(async term => {
            try {
              this.loading = true;
              this.cd.detectChanges();

              let nav = this.navQuery.getValue();

              let payload: ToBackendSuggestDimensionValuesRequest['input'] = {
                projectId: nav.projectId,
                repoId: nav.repoId,
                branchId: nav.branchId,
                envId: nav.envId,
                structId: this.structId,
                modelId: modelId,
                fieldId: fieldId,
                chartId: this.chartId,
                dashboardId: this.dashboardId,
                reportId: this.reportId,
                rowId: this.rowId,
                term: term,
                cellMetricsStartDateMs: undefined,
                cellMetricsEndDateMs: undefined
              };

              let q1Resp: ToBackendSuggestDimensionValuesResponse =
                await this.apiService
                  .req({
                    route: 'api/ToBackendSuggestDimensionValues',
                    payload: payload
                  })
                  .pipe(take(1))
                  .toPromise();

              let output: ToBackendSuggestDimensionValuesOutput =
                unwrapBackendResponseOutput({
                  response: q1Resp
                });

              if (isDefined(output.errorMessage)) {
                this.items = isDefinedAndNotEmpty(this.searchValue)
                  ? [
                      {
                        id: 0,
                        name: this.searchValue
                      },
                      {
                        id: 1,
                        name: 'Error: Suggest Values Failed',
                        errorMessage: output.errorMessage,
                        disabled: true
                      }
                    ]
                  : [
                      {
                        id: 0,
                        name: 'Error: Suggest Values Failed',
                        errorMessage: output.errorMessage,
                        disabled: true
                      }
                    ];
              } else if (isDefined(output.matchedValuesMessage)) {
                this.items = isDefinedAndNotEmpty(this.searchValue)
                  ? [
                      {
                        id: 0,
                        name: this.searchValue
                      },
                      {
                        id: 1,
                        name: output.matchedValuesMessage,
                        disabled: true
                      }
                    ]
                  : [
                      {
                        id: 0,
                        name: output.matchedValuesMessage,
                        disabled: true
                      }
                    ];
              } else {
                this.items = (output.matchedValues ?? []).map((x, i) => ({
                  id: i,
                  name: x.value
                }));

                if (isDefinedAndNotEmpty(this.searchValue)) {
                  let searchValueLc = this.searchValue.toLowerCase();

                  let hasSearchValue = this.items.some(
                    item => item.name?.toLowerCase() === searchValueLc
                  );

                  if (hasSearchValue === false) {
                    this.items = [
                      {
                        id: 0,
                        name: this.searchValue
                      },
                      ...this.items.map(item => {
                        let newItem = Object.assign(item, {
                          id: item.id + 1
                        });

                        return newItem;
                      })
                    ];
                  }
                }
              }
            } catch (error: any) {
              this.loading = false;
              this.cd.detectChanges();

              throw new Error(
                `Failed to get filter suggestions: ${error.message}`
              );
            }

            this.loading = false;
            this.cd.detectChanges();

            return;
          })
        )
        .subscribe();
    }
  }

  buildFractionForm() {
    this.fractionForm = this.fb.group({
      stringValue: this.fb.control<string>(
        this.fraction.stringValue,
        Validators.compose([Validators.required, Validators.maxLength(255)])
      )
    });
  }

  stringValueSearch(searchObj: any) {
    this.searchValue = searchObj.term;
  }

  stringValueChange(event: any) {
    (document.activeElement as HTMLElement).blur();

    let value = this.fractionForm.controls['stringValue'].value;

    if (value !== this.fraction.stringValue) {
      this.fraction = this.getChangedFraction({ value: value });

      if (this.fractionForm.valid) {
        this.emitFractionUpdate();
      }
    }
  }

  stringValueBlur() {
    let value = this.fractionForm.controls['stringValue'].value;

    if (value !== this.fraction.stringValue) {
      this.fraction = this.getChangedFraction({ value: value });

      if (this.fractionForm.valid) {
        this.emitFractionUpdate();
      }
    }
  }

  updateControlValueFromFraction() {
    this.fractionForm.controls['stringValue'].setValue(
      this.fraction.stringValue
    );
  }

  getChangedFraction(item: { value: string }) {
    let { value } = item;

    let fractionType = this.fraction.type;

    let mBrick =
      fractionType === 'StringIsEqualTo'
        ? `f\`${value}\``
        : fractionType === 'StringStartsWith'
          ? `f\`${value}%\``
          : fractionType === 'StringEndsWith'
            ? `f\`%${value}\``
            : fractionType === 'StringContains'
              ? `f\`%${value}%\``
              : fractionType === 'StringIsLike'
                ? `f\`${value}\``
                : fractionType === 'StringIsNotEqualTo'
                  ? `f\`-${value}\``
                  : fractionType === 'StringDoesNotStartWith'
                    ? `f\`-${value}%\``
                    : fractionType === 'StringDoesNotEndWith'
                      ? `f\`-%${value}\``
                      : fractionType === 'StringDoesNotContain'
                        ? `f\`-%${value}%\``
                        : fractionType === 'StringIsNotLike'
                          ? `f\`-${value}\``
                          : '';

    let newFraction: Fraction = {
      brick: mBrick,
      parentBrick: mBrick,
      operator: this.fraction.operator,
      type: fractionType,
      stringValue: value
    };

    return newFraction;
  }

  emitFractionUpdate() {
    this.fractionUpdate.emit({
      fraction: this.fraction,
      fractionIndex: this.fractionIndex
    });
  }

  typeChange(fractionTypeItem: FractionTypeItem) {
    let fractionType = fractionTypeItem.value;

    switch (fractionType) {
      case 'StringIsAnyValue': {
        let mBrick = MALLOY_FILTER_ANY;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'Or',
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case 'StringIsEqualTo': {
        let mBrick = `f\`${this.defaultStringValue}\``;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'Or',
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case 'StringStartsWith': {
        let mBrick = `f\`${this.defaultStringValue}%\``;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'Or',
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case 'StringEndsWith': {
        let mBrick = `f\`%${this.defaultStringValue}\``;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'Or',
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case 'StringContains': {
        let mBrick = `f\`%${this.defaultStringValue}%\``;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'Or',
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case 'StringIsLike': {
        let mBrick = `f\`a%c\``;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'Or',
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case 'StringIsNull': {
        let mBrick = 'f`null`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'Or',
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case 'StringIsEmpty': {
        let mBrick = 'f`empty`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'Or',
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case 'StringIsNotEqualTo': {
        let mBrick = `f\`-${this.defaultStringValue}\``;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'And',
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case 'StringDoesNotStartWith': {
        let mBrick = `f\`-${this.defaultStringValue}%\``;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'And',
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case 'StringDoesNotEndWith': {
        let mBrick = `f\`-%${this.defaultStringValue}\``;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'And',
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case 'StringDoesNotContain': {
        let mBrick = `f\`-%${this.defaultStringValue}%\``;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'And',
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case 'StringIsNotLike': {
        let mBrick = `f\`-a%c\``;

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'And',
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case 'StringIsNotEmpty': {
        let mBrick = 'f`-empty`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'And',
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case 'StringIsNotNull': {
        let mBrick = 'f`-null`';

        this.fraction = {
          brick: mBrick,
          parentBrick: mBrick,
          operator: 'And',
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      default: {
      }
    }
  }
}
