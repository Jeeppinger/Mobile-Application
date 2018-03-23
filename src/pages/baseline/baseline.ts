import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
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
  answers: any = {};
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
  study: any;

  constructor(public afs: AngularFirestore, public navCtrl: NavController,
    public navParams: NavParams, public storage: Storage) {
      //initial sign in
      this.base = navParams.get('start');
      this.moduleType = navParams.get('type');
      this.study = navParams.get('study');
      this.sleep_end = '';
      this.sleep_start = '';

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
              console.log(err);
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
      this.answers[this.qID] = this.userInfo.ans;

      //submit answer to database
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

      var today = new Date();
      var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date+' '+time;
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

      this.storage.get('user').then((val) => {
        if (val)
        {
          try
          {
            localforage.getItem(modKey).then(function(value) {
                // This code runs once the value has been loaded
                // from the offline store.
                var temp: any = {};
                temp = value;
                var firestoreID = temp.modID;
                if (value == null){
                  alert('failure');
                }
                else {
                  self.afs.firestore.doc('/Answers/'+val).collection(firestoreID).doc(dateTime).set(self.answers);
                }
            }).catch(function(err) {
                // This code runs if there were any errors
                console.log(err);
            });
          }
          catch (e) {
            //this.questionsType = "Unable to Store Answer";
            alert("Unable to Store Answer");
          }
        }
      });
      this.navCtrl.push(TabsPage);
    }

    submitQuestion(){
      this.answers[this.qID] = this.userInfo.ans;
      var nextQ = this.branching[this.qID];
      if (nextQ[0] == '-1'){
        this.questionsType = "End of Module";
      }
      else if (nextQ.length == 1){
        //no branching
        this.qID = nextQ[0];
        this.userInfo.ans = "";
        this.resetQuestion(nextQ[0]);
      }
      else{
        //branching
        //get index of answer, only possible for radio right now
        var index = this.options.indexOf(this.userInfo.ans);
        alert("next: " + index);
        this.qID = nextQ[index];
        this.userInfo.ans = "";
        this.resetQuestion(nextQ[index]);
      }

    }

    ionViewDidLoad() {

    }

}
