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
    for (let propertyName in this.control.errors) {
      if (
        Object.prototype.hasOwnProperty.call(this.control.errors, propertyName)
      ) {
        return ValidationService.getValidatorErrorMessage(
          propertyName,
          this.control.errors[propertyName]
        );
      }
    }
    return null;
  }
}
