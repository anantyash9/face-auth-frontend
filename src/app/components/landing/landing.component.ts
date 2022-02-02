import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable }  from 'rxjs';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {

  formGroup: any;
  titleAlert: string = 'This field is required';
  post: any = '';

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.createForm();
    this.setChangeValidate()
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'eventid': [null, Validators.required],
      'candidateid': [null, Validators.required],
      'validate': ''
    });
  }

  setChangeValidate() {
    this.formGroup.get('validate').valueChanges.subscribe(
      (validate: string) => {
        if (validate == '1') {
          this.formGroup.get('eventid').setValidators([Validators.required, Validators.minLength(3)]);
          this.titleAlert = "You need to specify at least 3 characters";
        } else {
          this.formGroup.get('eventid').setValidators(Validators.required);
        }
        this.formGroup.get('eventid').updateValueAndValidity();
      }
    )
  }

  get candidateid() {
    return this.formGroup.get('candidateid') as FormControl
  }

  get eventid() {
    return this.formGroup.get('eventid') as FormControl
  }

  onSubmit(post: any) {
    console.log(post)
    this.post = post;
  }

}
