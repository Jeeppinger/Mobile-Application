import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AngularFirestore } from 'angularfire2/firestore';
import 'rxjs/add/operator/map';
import { TabsPage } from '../tabs/tabs';

import * as localforage from "localforage";
declare var cordova;
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
  answers: any = {};
  questionsType: any;
  questionsText: any;
  questionsName: any;
  moduleType: any;
  qID: any;
  mID: any;
  mod: any;
  base: any;
  idToCancel: any;
  options: any;
  counter: any = 0;
  completedQIDs: any = [];

  constructor(public afs: AngularFirestore, public navCtrl: NavController,
    public navParams: NavParams, public storage: Storage) {
      //initial sign in
      this.base = navParams.get('start');
      this.moduleType = navParams.get('type');

      if (this.base != 'true'){
        this.mod = navParams.get('mID');
        this.mID = "" + this.mod;
        if (this.moduleType == 'Time Initiated'){
          this.idToCancel = navParams.get('idToCancel');
        }
      }
      this.startModule();
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
              self.questionsName = storedQuestion.name;
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
        else if (this.moduleType == 'End Module'){
          modKey = "end";
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
      this.answers[this.questionsName] = this.userInfo.ans;

      if (this.moduleType == 'Time Initiated'){
        let self = this;
        localforage.getItem(this.mID).then(function(value) {
            // This code runs once the value has been loaded
            // from the offline store.
            var temp: any = {};
            temp = value;
            if (value == null){
              alert('failure');
            }
            else {
              temp.triggered = 'no';
              //store it back
              localforage.setItem(self.mID, temp).then(function (value) {
              // Do other things once the value has been saved.
              console.log(value);
              }).catch(function(err) {
                  // This code runs if there were any errors
                  console.log(err);
              });
            }
        }).catch(function(err) {
            // This code runs if there were any errors
            console.log(err);
        });
      }

      //submit answer to database

      var today = new Date();
      var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date+' '+time;
      let self = this;
      var modKey: any;

      if (this.moduleType == 'base'){
        modKey = "base";
        localforage.getItem("base").then(function(value) {
            // This code runs once the value has been loaded
            // from the offline store.
            var temp: any = {};
            temp = value;
            if (value == null){
              alert('failure4');
            }
            else {
              temp.completed = 'yes';
              localforage.setItem("base", temp);
            }
        }).catch(function(err) {
            // This code runs if there were any errors
            console.log(err);
        });
      }
      else if (this.moduleType == 'Time Initiated'){
        modKey = this.mID;

        cordova.plugins.notification.badge.decrease(1, function (badge) {
          // decrease badge
        });


        //clear notification
        cordova.plugins.notification.local.clear(this.idToCancel, function() {

        });

      }

      else if (this.moduleType == 'User Initiated'){
        modKey = "UImod" + this.mID;
      }

      else if (this.moduleType == 'End Module'){
        modKey = "end";
        //will need to logout after submission
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
                var firestoreID = temp.name;
                if (value == null){
                  alert('failure');
                }
                else {
                  let that = self;
                  self.afs.firestore.doc('/Answers/'+ val).get().then(function(querySnapshot) {
                    var tempSnap: any = {};
                    tempSnap = querySnapshot;
                    var modIDArray: any = tempSnap.data().moduleIDs;
                    if (modIDArray == null){
                      modIDArray = [];
                    }
                    if (!modIDArray.includes(firestoreID)){
                      modIDArray.push(firestoreID);
                      that.afs.firestore.doc('/Answers/'+ val).set({
                          moduleIDs: modIDArray
                      });
                    }
                  });
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
      this.counter++;
      this.answers[this.questionsName] = this.userInfo.ans;
      this.completedQIDs.push(this.qID);
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
        this.qID = nextQ[index];
        this.userInfo.ans = "";
        this.resetQuestion(nextQ[index]);
      }

    }

    prevQuestion(){
      this.userInfo.ans = "";
      var key = this.completedQIDs.pop();
      this.qID = key;
      this.resetQuestion(key);
      delete this.answers[key];
      this.counter--;
    }

    ionViewDidLoad() {

    }

}
