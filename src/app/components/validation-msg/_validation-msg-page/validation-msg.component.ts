import { Component, Input } from '@angular/core';
import * as services from '@app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-validation-msg',
  templateUrl: './validation-msg.component.html',
  styleUrls: ['./validation-msg.component.scss']
})
export class ValidationMsgComponent {
  @Input() errors: any;

  get errorMessage() {
    for (let propertyName in this.errors) {
      if (this.errors.hasOwnProperty(propertyName)) {
        return services.ValidationService.getValidatorErrorMessage(
          propertyName,
          this.errors[propertyName]
        );
      }
    }
    return null;
  }
}
