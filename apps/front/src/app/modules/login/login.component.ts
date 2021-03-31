import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'mprove-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  constructor(private readonly fb: FormBuilder) {}

  onSubmit() {}
}
