import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { AngularFirestore } from 'angularfire2/firestore';
import { App } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { TabsPage } from '../tabs/tabs';

import { ModulePage } from '../module/module';
import { BaselinePage } from '../baseline/baseline';
import { SplashScreen } from '@ionic-native/splash-screen';

import * as localforage from "localforage";

declare var cordova;

export interface Participant {
  id:string;
}

interface Branch {
    [ key: string ]: any;
}

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  cordova: any;
  user:any;
  participants: Observable<any[]>;
  baseModuletoReturn: any = {};
  allQuestions: any = [];
  authenticated: any = '';
  sleep_start: any = '';
  sleep_end: any = '';
  studyEndDate: any;
  notificationID: any = 0;

  constructor(public afAuth: AngularFireAuth, public afs: AngularFirestore,
    public navCtrl: NavController, public navParams: NavParams,
    public storage: Storage, public splashScreen: SplashScreen,
    public appCtrl: App, public alertCtrl: AlertController) {
      splashScreen.show();
  }

  showConfirm() {
  let confirm = this.alertCtrl.create({
    title: 'Confirmation',
    message: 'To confirm, you sleep from ' + this.sleep_start + ' to ' + this.sleep_end + "?",
    buttons: [
      {
        text: 'No',
        handler: () => {
        }
      },
      {
        text: 'Yes',
        handler: () => {
          this.login();
          //this.sleep();
        }
      }
    ]
  });
  confirm.present();
  }

public sleep() {

    this.splashScreen.show();
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > 2000){
        this.splashScreen.hide();
        break;
      }
    }

  }

public sleepTest (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

  authenticateUser(){
    try
    {
      let self = this;
      this.afs.firestore.doc('/Participants/'+this.user).get()
        .then(docSnapshot => {
          if (docSnapshot.exists) {
            self.authenticated = 'true';
          }
          else
          {
            alert('Invalid Login. Please ensure your User ID is input correctly, or contact your research administrator for assistance.');
          }
        });
    }
    catch (e) {
      alert(e);
    }
  }

  storeSleepTimes(){
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

    let self = this;

    localforage.setItem("sleep", sleep).then(function (value) {
    // Do other things once the value has been saved.
    self.login();
    }).catch(function(err) {
        // This code runs if there were any errors
        console.log(err);
    });

  }

login(){
    var studyID: any;
    var studyName: any;

    try
    {
      let self = this;
      studyID = this.afs.firestore.doc('/Participants/'+this.user).get()
        .then(docSnapshot => {
          if (docSnapshot.exists) {
            //locally store user ID and study ID
            this.storage.set('user', this.user);
            studyID = docSnapshot.data().study_id;
            studyName = docSnapshot.data().study;
            this.storage.set('study_id', studyID);
            cordova.plugins.notification.badge.set(0);
            this.appCtrl.getRootNav().setRoot(BaselinePage, {
              start: 'true',
              type: 'base',
              study: studyName
            });
            self.splashScreen.show();
            self.sleepTest(3000).then(() => {
              self.splashScreen.hide();
          });
            //self.sleep();
            return studyID;
          }
          else
          {
            alert('Invalid Login');
            return;
          }
        });

        studyID.then(function(id) {
          self.getModules(id);
        });
    }
    catch (e) {
      alert(e);
    }
  }

  getModules(id){
    var localArray = [];
    var counter = 0;
    var arrayOfModuleIDs;
    let self = this;

    //get the study end date
    this.afs.firestore.doc('/Studies/'+ id).get().then(function(querySnapshot) {
      var date = querySnapshot.data().end;
      //set end date
      var end_date = new Date(date);

      var wake_up = "" + self.sleep_end;
      wake_up = wake_up.substring(0,2);

      var wake = +wake_up;

      self.studyEndDate = end_date;

      localforage.setItem("end_date", end_date);

      //schedule hard coded notifications
      self.scheduleModule("1day",1);
    });

    //get all documents in a collection
    arrayOfModuleIDs = this.afs.firestore.doc('/Studies/'+ id).collection("modules").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        localArray[counter] = doc.data().id;
        counter++;
      });
      return localArray;
    });

    arrayOfModuleIDs.then(function(id) {
      self.storeModules(id);
    });

  }

  storeModules(arrayOfModuleIDs){
    let self = this;


    var branchArray: any;
    var uiModules: any;
    var tiModules: any;
    var branches: Branch;
    var key = 0;
    var tiKey = 0;

    //iterate through each module ID
    arrayOfModuleIDs.forEach(function (ModID) {

      uiModules = []; //holds all User Initiated Module Objects
      tiModules = []; //holds all Time Initiated Module Objects
      branchArray = []; //holds the branch logic of a current questions within a Module
      var questions: any; //holds the questions within a module
      //baseModule = {};
      branches = {}; //holds all branching logic of a current module
      //get the module in Firestore
      self.afs.firestore.doc('/Modules/'+ ModID).get().then(querySnapshot => {
        var modType = querySnapshot.data().type;
        var modName = querySnapshot.data().name;
        if (modType == "User Initiated")
        {
          questions = self.afs.firestore.doc('/Modules/'+ ModID).collection("Questions").get().then(function(querySnapshot) {
            var questionsArray = [];
            let that = self;

            //iterate through each question in the module
            querySnapshot.forEach(function(doc) {
              var outerQid = doc.data().id;
                if (!that.allQuestions.includes(outerQid)){
                  that.allQuestions.push(outerQid);
                  that.storeQuestions(outerQid);
                }
                questionsArray.push(outerQid);
                //each question has it's own set (array) of branching logic
                var branch = doc.data().branch;
                branchArray = [];
                branch.forEach(function (id) {
                  branchArray.push(id);
                });
                var index = "" + outerQid;
                branches[index] = branchArray;
            });
            return questionsArray;
        });
        questions.then(async function(id) {
          var uiModule = {
              type: modType,
              questionIDs: id,
              branching: branches,
              name: modName,
              modID: ModID
          };
          //push the created User Initiated module to the uiModules array
          uiModules.push(uiModule);
          var keyStorage = "UImod"+ key++;
          await localforage.setItem(keyStorage, uiModule).then(function (value) {
          // Do other things once the value has been saved.
          console.log(value);
          //self.doSomethingElse();
          }).catch(function(err) {
              // This code runs if there were any errors
              console.log(err);
          });
        });
      }

        else if (modType == "Time Initiated")
        {
          var interval = querySnapshot.data().every;
          questions = self.afs.firestore.doc('/Modules/'+ ModID).collection("Questions").get().then(function(querySnapshot) {
            var questionsArray = [];
            let that = self;
            //iterate through each question in the module
            querySnapshot.forEach(function(doc) {
              var outerQid = doc.data().id;
                if (!that.allQuestions.includes(outerQid)){
                  that.allQuestions.push(outerQid);
                  that.storeQuestions(outerQid);
                }
                questionsArray.push(outerQid);
                //each question has it's own set (array) of branching logic
                var branch = doc.data().branch;
                branchArray = [];
                branch.forEach(function (id) {
                  branchArray.push(id);
                });
                var index = "" + outerQid;
                branches[index] = branchArray;
            });
            return questionsArray;
          });
        questions.then(async function(id) {
          var tiModule = {
              id: "TImod"+ tiKey,
              type: modType,
              questionIDs: id,
              branching: branches,
              triggered: 'no',
              triggeredAt: '',
              name: modName,
              modID: ModID,
              interval: interval
          };

          //push the created User Initiated module to the uiModules array
          tiModules.push(tiModule);
          var keyStorage = "TImod"+ tiKey;
          //WILL NEED TO SCHEDULE NOTIFICATION
          self.scheduleModule(keyStorage, interval);
          tiKey++
          await localforage.setItem(keyStorage, tiModule).then(function (value) {
          // Do other things once the value has been saved.
          console.log(value);
          }).catch(function(err) {
              // This code runs if there were any errors
              console.log(err);
          });
        });
        }

        else if (modType == "Base Line")
        {
          questions = self.afs.firestore.doc('/Modules/'+ ModID).collection("Questions").get().then(function(querySnapshot) {
            var questionsArray = [];
            let that = self;
            //iterate through each question in the module
            querySnapshot.forEach(function(doc) {
              var outerQid = doc.data().id;
                if (!that.allQuestions.includes(outerQid)){
                  that.allQuestions.push(outerQid);
                  that.storeQuestions(outerQid);
                }
                questionsArray.push(outerQid);
                //each question has it's own set (array) of branching logic
                var branch = doc.data().branch;
                branchArray = [];
                branch.forEach(function (id) {
                  branchArray.push(id);
                });
                var index = "" + outerQid;
                branches[index] = branchArray;
            });
            return questionsArray;
        });
        questions.then(function(id) {
          var base = {
              id: 1, //for testing
              type: modType,
              questionIDs: id,
              branching: branches,
              name: modName,
              modID: ModID,
              completed: 'no'
          };
          localforage.setItem("base", base).then(function (value) {
          // Do other things once the value has been saved.
          console.log(value);
          }).catch(function(err) {
              // This code runs if there were any errors
              console.log(err);
          });
        });
        }

        else if (modType == "End Module")
        {
          questions = self.afs.firestore.doc('/Modules/'+ ModID).collection("Questions").get().then(function(querySnapshot) {
            var questionsArray = [];
            let that = self;
            //iterate through each question in the module
            querySnapshot.forEach(function(doc) {
              var outerQid = doc.data().id;
                if (!that.allQuestions.includes(outerQid)){
                  that.allQuestions.push(outerQid);
                  that.storeQuestions(outerQid);
                }
                questionsArray.push(outerQid);
                //each question has it's own set (array) of branching logic
                var branch = doc.data().branch;
                branchArray = [];
                branch.forEach(function (id) {
                  branchArray.push(id);
                });
                var index = "" + outerQid;
                branches[index] = branchArray;
            });
            return questionsArray;
        });
        questions.then(function(id) {
          var end = {
              id: 1, //for testing
              type: modType,
              questionIDs: id,
              branching: branches,
              name: modName,
              modID: ModID,
              triggered: 'no',
              completed: 'no'
          };
          localforage.setItem("end", end).then(function (value) {
          // Do other things once the value has been saved.
          console.log(value);
          //self.doSomethingElse();
          }).catch(function(err) {
              // This code runs if there were any errors
              console.log(err);
          });
          self.scheduleModule("end", 1);
        });
        }
        var branches = {};
      });
    });

  }

  scheduleModule(id, interval) {
      var notifications = [];
      var notif: any = {};
      var count = 1;

      var start_sleep = "" + this.sleep_start;
      var end_sleep = "" + this.sleep_end;

      start_sleep = start_sleep.substring(0,2);
      end_sleep = end_sleep.substring(0,2);

      var end = +start_sleep;
      var start = +end_sleep;

      var nextOccurence = new Date();
      nextOccurence.setHours(start);
      nextOccurence.setMinutes(0);
      nextOccurence.setSeconds(0);

      var currentHour = start;
      var currentMinutes = 0;

      if (id == "end"){
        var end_date: any= new Date(this.studyEndDate);
        notif = {
          id: this.notificationID++,
          title: 'Study Ended',
          foreground: true,
          text: 'The study has ended. Please complete the final module',
          data: { notiID: id, type: "End Module"},
          at: end_date
        };
        notifications.push(notif);
      }

      else if (id == "1day"){
        var this_morning = new Date();

        var next_morning = new Date();
        next_morning.setDate(this_morning.getDate() + 1);
        next_morning.setHours(start);
        next_morning.setMinutes(0);
        next_morning.setSeconds(0);

        notif = {
          id: this.notificationID++,
          title: 'Good Morning!',
          foreground: true,
          text: 'We wish you a happy first morning sharing how you walk in health and beauty! Throughout each day, please remember to log in each meal, and answer in-the-moment questions.',
          data: { notiID: id, type: "1day"},
          at: next_morning
        };
        notifications.push(notif);
      }

      else{
        if (start < end){
          while(currentHour < end)
          {
            notif = {
              id: this.notificationID++,
              title: 'Please Complete Module',
              text: 'It is time to share your in-the-moment experiences with Walking in Hózhó',
              data: { notiID: id, type: "Time Initiated"},
              foreground: true,
              every: { hour: currentHour, minute: currentMinutes },
              };
              count++;
              notifications.push(notif);
              //alert("notification created for " + id + " at " + currentHour + ":" + currentMinutes);
              nextOccurence = new Date(nextOccurence.getTime() + interval);
              currentHour = nextOccurence.getHours();
              currentMinutes = nextOccurence.getMinutes();
          }
        }

        else{
          var currentTime = new Date();
          currentTime.setHours(start);
          currentTime.setMinutes(0);
          currentTime.setSeconds(0);

          var secondTime = new Date();
          secondTime.setHours(end);
          secondTime.setMinutes(0);
          secondTime.setSeconds(0);
          secondTime = new Date(secondTime.getTime() + (1000 * 60 * 60 * 24));

          while(currentTime.getTime() < secondTime.getTime())
          {
            notif = {
              id: this.notificationID++,
              title: 'Please Complete Module',
              text: 'It is time to share your in-the-moment experiences with Walking in Hózhó',
              data: { notiID: id, type: "Time Initiated"},
              foreground: true,
              every: { hour: currentHour, minute: currentMinutes },
            };
            notifications.push(notif);
            currentTime = new Date(currentTime.getTime() + interval);
            currentHour = currentTime.getHours();
            currentMinutes = currentTime.getMinutes();
          }
        }
      }
      cordova.plugins.notification.local.schedule(notifications);

  }

  storeQuestions(id){
    var optionsArray = [];

      this.afs.firestore.doc('/Questions/'+ id).get().then(function(querySnapshot) {
        var options = querySnapshot.data().options;
        var qname = querySnapshot.data().name;
        var qtype = querySnapshot.data().type;
        var qtext = querySnapshot.data().qtext;


        console.log(options);
        optionsArray = [];
        options.forEach(function (oid) {
          optionsArray.push(oid);
        });

        var question = {
            name: qname,
            type: qtype,
            text: qtext,
            options: optionsArray
        };

        //store question
        localforage.setItem(id, question).then(function (value) {
        // Do other things once the value has been saved.
        console.log(value);
        }).catch(function(err) {
            // This code runs if there were any errors
            console.log(err);
        });

      });

  }

  ionViewDidLoad() {
    try
    {
      //check if user has logged in
      this.storage.get('user').then((val) => {
        if (val)
        {
          this.navCtrl.setRoot(TabsPage);
        }
        else
        {
          this.splashScreen.hide();
        }
      });
    }
    catch(e){
      this.splashScreen.hide();
      console.error(e);
    }
  }
}
