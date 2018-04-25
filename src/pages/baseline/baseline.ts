import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AngularFirestore } from 'angularfire2/firestore';
import 'rxjs/add/operator/map';
import { TabsPage } from '../tabs/tabs';
import * as localforage from "localforage";
import { SplashScreen } from '@ionic-native/splash-screen';
import { AlertController } from 'ionic-angular';

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
  questionsName: any;
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
  counter: any = 0;
  completedQIDs: any = [];
  baseExists: any = '';


  constructor(public afs: AngularFirestore, public navCtrl: NavController,
    public navParams: NavParams, public storage: Storage,
    public splashScreen: SplashScreen, public alertCtrl: AlertController) {
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

    public exitModule(){
      let confirm = this.alertCtrl.create({
        title: 'Exit Module',
        message: 'All answers given in the current module will be lost if you choose to exit.',
        buttons: [
          {
            text: 'Cancel',
            handler: () => {
            }
          },
          {
            text: 'Exit Module',
            handler: () => {
              this.navCtrl.push(TabsPage);
            }
          }
        ]
      });
      confirm.present();
    }
    public continue(){
      this.loadBase();
    }

    public completeLater(){
      localforage.getItem("base").then(function(value) {
          // This code runs once the value has been loaded
          // from the offline store.
          var temp: any = {};
          temp = value;
          if (value == null){
            alert('failure3');
          }
          else {
            temp.completed = 'no';
            localforage.setItem("base", temp);
          }
      }).catch(function(err) {
          // This code runs if there were any errors
          console.log(err);
      });
      this.navCtrl.push(TabsPage);
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
              if (self.questionsType== 'slider'){
                self.userInfo.ans = 50;
              }
            }
          }).catch(function(err) {
              // This code runs if there were any errors
              console.log(err);
          });

    }

    public startModule(){
      try
      {
        this.baseExists = 'progress';
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

    public parseMultiChoice(){
        var counter = 0;
        var selectedAnswers = this.userInfo.ans;
        var stringToReturn = "";

        this.options.forEach(function (value) {
          if (selectedAnswers.includes(""+counter)){
            stringToReturn = stringToReturn + "1:"+value+"&&";
          }
          else{
            stringToReturn = stringToReturn + "0:"+value+"&&";
          }
          counter++;
        });

        //take off the last &&
        stringToReturn = stringToReturn.substring(0, stringToReturn.length - 2);
        return stringToReturn;
    }

    submitModule(){
      if (this.questionsType== 'multi'){
        this.answers[this.questionsName] = this.parseMultiChoice();
      }
      else{
        this.answers[this.questionsName] = this.userInfo.ans;
      }
      localforage.getItem("base").then(function(value) {
          // This code runs once the value has been loaded
          // from the offline store.
          var temp: any = {};
          temp = value;
          if (value == null){
            alert('failure3');
          }
          else {
            temp.completed = 'yes';
            localforage.setItem("base", temp);
          }
      }).catch(function(err) {
          // This code runs if there were any errors
          console.log(err);
      });

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
                var firestoreID = temp.name;
                if (value == null){
                  alert('failure');
                }
                else {
                  let that = self;
                  self.afs.firestore.doc('/Answers/'+ val).get().then(function(querySnapshot) {
                    if (!querySnapshot.exists)
                    {
                      modIDArray = [];
                      modIDArray.push(firestoreID);
                      that.afs.firestore.doc('/Answers/'+ val).set({
                          moduleIDs: modIDArray
                      });
                      that.afs.firestore.doc('/Answers/'+val).collection(firestoreID).doc(dateTime).set(self.answers);
                    }
                    else
                    {
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
                      that.afs.firestore.doc('/Answers/'+val).collection(firestoreID).doc(dateTime).set(self.answers);
                    }

                  });
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
      if (this.questionsType== 'multi'){
        this.answers[this.questionsName] = this.parseMultiChoice();
      }
      else{
        this.answers[this.questionsName] = this.userInfo.ans;
      }
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
        if (nextQ[index] == '-1'){
          this.questionsType = "End of Module";
        }
        else{
          this.qID = nextQ[index];
          this.userInfo.ans = "";
          this.resetQuestion(nextQ[index]);
        }
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

    loadBase(){
      let self = this;
      //this.splashScreen.show();
      localforage.getItem("base").then(function(value) {
            // This code runs once the value has been loaded
            // from the offline store.
            var storedQuestion: any = {};
            storedQuestion = value;

            if (value == null){
              self.baseExists = 'false';
            }
            else {
              self.baseExists = 'true';
            }
            //this.splashScreen.hide();
          }).catch(function(err) {
              // This code runs if there were any errors
              self.baseExists = 'false';
              this.splashScreen.show();
              console.log(err);
          });
    }

    goToHome(){
      this.navCtrl.push(TabsPage);
    }
    ionViewDidLoad() {

    }

}
