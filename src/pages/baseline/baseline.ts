import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { AngularFirestore } from 'angularfire2/firestore';
import 'rxjs/add/operator/map';
import { TabsPage } from '../tabs/tabs';
import * as localforage from "localforage";

/**
 * Generated class for the BaselinePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-baseline',
  templateUrl: 'baseline.html',
})
export class BaselinePage {

  userInfo: {name: string, ans: any, email: string, phone: string} = {name: '', ans: '', email: '', phone: ''};
  branching: any = {};
  questionsType: any;
  questionsText: any;
  moduleType: any;
  qID: any;
  mID: any;
  mod: any;
  base: any;
  options: any;
  started: any;
  sleep_start: any;
  sleep_end: any;

  constructor(public afs: AngularFirestore, public navCtrl: NavController,
    public navParams: NavParams) {
      //initial sign in
      this.base = navParams.get('start');
      this.moduleType = navParams.get('type');

      if (this.base != 'true'){
        this.mod = navParams.get('mID');
        this.mID = "" + this.mod;
        this.startModule();
      }
    }


    /*
      This function takes in a questiod ID and displays the correct question
    */
    public resetQuestion(questionID){

      let self = this;
      localforage.getItem(questionID).then(function(value) {
            // This code runs once the value has been loaded
            // from the offline store.
            var storedQuestion: any = {};
            storedQuestion = value;

            if (value == null){
              self.questionsType = "Invalid";
            }
            else {
              self.questionsType = storedQuestion.type;
              self.questionsText = storedQuestion.text;
              self.options = storedQuestion.options;
            }
          }).catch(function(err) {
              // This code runs if there were any errors
              //console.log(err);
          });

    }

    public startModule(){
      try
      {
        var questionID;
        let self = this;
        var modKey: any;

        if (this.moduleType == 'base'){
          modKey = "base";
        }
        else if (this.moduleType == 'Time Initiated'){
          modKey = this.mID;
        }
        else if (this.moduleType == 'User Initiated'){
          modKey = "UImod" + this.mID;
        }

        localforage.getItem(modKey).then(function(value) {
              // This code runs once the value has been loaded
              // from the offline store.
              var module: any = {};
              if (value == null){
                console.log("Module doesn't exist");
              }
              else {
                module = value;
                if (self.moduleType == 'base'){
                  self.mID = "" + module.id;
                }
                questionID = '' + module.questionIDs[0];
                self.branching = module.branching;
                self.qID = questionID;
                self.resetQuestion(questionID);
                self.started = 'yes';
              }
            }).catch(function(err) {
                // This code runs if there were any errors
                console.log(err);
            });
      }
      catch (e) {
        this.questionsType = "Invalid";
        alert(e);
      }
    }

    submitModule(){
      var start_sleep = "" + this.sleep_start;
      var end_sleep = "" + this.sleep_end;

      start_sleep = start_sleep.substring(0,2);
      end_sleep = end_sleep.substring(0,2);

      var start_sleep_toStore = +start_sleep;
      var end_sleep_toStore = +end_sleep;

      var sleep = {
          sleep_start: start_sleep_toStore,
          sleep_end: end_sleep_toStore
      };

      localforage.setItem("sleep", sleep);
      this.navCtrl.push(TabsPage);
      //submit answer to database
      /*
      var data = {
        name: 'TEST',
        [this.questions]: this.userInfo.ans
      };
      var today = new Date();
      var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date+' '+time;

      this.storage.get('user').then((val) => {
        if (val)
        {
          try
          {
            this.afs.firestore.doc('/Answers/'+val).collection("Modules").doc(dateTime).set(data);
          }
          catch (e) {
            //this.questionsType = "Unable to Store Answer";
            alert("Unable to Store Answer");
          }
        }
      });
      */
    }

    submitQuestion(){
      var nextQ = this.branching[this.qID];
      if (nextQ[0] == '-1'){
        this.questionsType = "End of Module";
      }
      else{
        //will need to replace 0 with answer index
        this.qID = nextQ[0];
        this.userInfo.ans = "";
        this.resetQuestion(nextQ[0]);
      }

    }

    ionViewDidLoad() {

    }

}
