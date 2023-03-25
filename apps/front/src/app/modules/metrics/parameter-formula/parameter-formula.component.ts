import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { interfaces } from '~front/barrels/interfaces';
import { ParameterFilter } from '../row/row.component';

@Component({
  selector: 'm-parameter-formula',
  templateUrl: 'parameter-formula.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParameterFormulaComponent implements OnInit {
  @Input() isDisabled: boolean;
  @Input() parameterFilter: ParameterFilter;

  @Output() parameterFormulaUpdate =
    new EventEmitter<interfaces.EventParameterFormulaUpdate>();

  parameterFormulaForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildParameterFormulaForm();
  }

  buildParameterFormulaForm() {
    this.parameterFormulaForm = this.fb.group({
      formula: [this.parameterFilter.formula, [Validators.required]]
    });
  }

  parameterFormulaBlur() {
    let value = this.parameterFormulaForm.controls['formula'].value;

    if (
      value !== this.parameterFilter.formula &&
      this.parameterFormulaForm.valid
    ) {
      this.parameterFormulaUpdate.emit({ formula: value });
    }
  }
}
