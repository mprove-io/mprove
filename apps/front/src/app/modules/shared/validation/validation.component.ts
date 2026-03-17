import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ValidationService } from '#front/app/services/validation.service';

@Component({
  standalone: false,
  selector: 'm-validation',
  templateUrl: './validation.component.html'
})
export class ValidationComponent {
  @Input() control: AbstractControl;

  get errorMessage() {
    let errorKeys = Object.keys(this.control.errors || {});

    let firstKey = errorKeys[0];

    if (firstKey) {
      return ValidationService.getValidatorErrorMessage(
        firstKey,
        this.control.errors[firstKey]
      );
    }
    return null;
  }
}
