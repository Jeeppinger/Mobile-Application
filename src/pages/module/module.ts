import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { AngularFirestore } from 'angularfire2/firestore';
import 'rxjs/add/operator/map';
import { TabsPage } from '../tabs/tabs';
import * as localforage from "localforage";

/**
 * Generated class for the ModulePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-module',
  templateUrl: 'module.html',
})
export class ModulePage {

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

  constructor(public afs: AngularFirestore, public navCtrl: NavController,
    private storage: Storage, public navParams: NavParams) {
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
      This function takes in the user's answer and decides which answer should
      be displayed next.
    */
    public getNextQuestion(answer){


    }


    /*
      This function takes in a questiod ID and displays the correct question
    */
    public resetQuestion(questionID){

      let self = this;
      localforage.getItem(questionID).then(function(value) {
            // This code runs once the value has been loaded
            // from the offline store.
            var storedQuestion = value;

            if (value == null){
              self.questionsType = "Invalid";
            }
            else {
              self.questionsType = storedQuestion.type;
              self.questionText = storedQuestion.text;
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
        var executed = false;
        let self = this;
        var modKey: any;

        if (this.moduleType == 'base'){
          modKey = "base";
        }
        else if (this.moduleType == 'Time Initiated'){
          modKey = "TImod" + this.mID;
        }
        else if (this.moduleType == 'User Initiated'){
          modKey = "UImod" + this.mID;
        }

        localforage.getItem(modKey).then(function(value) {
              // This code runs once the value has been loaded
              // from the offline store.
              if (value == null){
                console.log("Module doesn't exist");
              }
              else {
                let module = value;
                if (self.moduleType == 'base'){
                  self.mID = "" + module.id;
                }
                questionID = '' + module.questionIDs[0];
                self.branching = module.branching;
                self.qID = questionID;
                self.currentIndex = 0;
                self.resetQuestion(questionID);
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
