import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';


@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {
  authForm: FormGroup;

    constructor(private navController: NavController, private fb: FormBuilder, public navCtrl: NavController) {
/*
      this.authForm = this.fb.group({
                'usersex': ['', Validators.compose([Validators.required])],
                'emotions': ['', Validators.compose([Validators.required])],
                'eattoggle': ['false', Validators.compose([Validators.required])],
                'eattime': ['', Validators.compose([Validators.required])],
                'excesstoggle': ['false', Validators.compose([Validators.required])],
                'radio1': ['', Validators.compose([Validators.required])],
                'slider1': ['', Validators.compose([Validators.required])],
                'slider2': ['', Validators.compose([Validators.required])]
            });
            */
        }
    	  logForm(){
    			 }
    }
