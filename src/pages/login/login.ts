import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { AngularFirestore } from 'angularfire2/firestore';
import { App } from 'ionic-angular';

import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { TabsPage } from '../tabs/tabs';
import { HomePage } from '../home/home';
import { ModulePage } from '../module/module';
import { SplashScreen } from '@ionic-native/splash-screen';
import * as localforage from "localforage";

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

  user:any;
  participants: Observable<any[]>;
  baseModuletoReturn: any = {};
  allQuestions: any = [];

  constructor(public afAuth: AngularFireAuth, public afs: AngularFirestore,
    public navCtrl: NavController, public navParams: NavParams,
    public storage: Storage, public splashScreen: SplashScreen,
    public appCtrl: App) {
      splashScreen.show();
  }

  login(){
    var studyID: any;

    try
    {
      studyID = this.afs.firestore.doc('/Participants/'+this.user).get()
        .then(docSnapshot => {
          if (docSnapshot.exists) {
            //locally store user ID and study ID
            this.storage.set('user', this.user);
            studyID = docSnapshot.data().study_id;
            this.storage.set('study_id', studyID);
            return studyID;
          }
          else
          {
            alert('Invalid Login');
          }
        });
        let self = this;

        studyID.then(function(id) {
          self.getModules(id);
        });
        this.appCtrl.getRootNav().setRoot(ModulePage, {
          start: 'true',
          type: 'base'
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
    var userInitiated = [];
    var timeInitiated = [];
    var branchArray: any;
    var uiModules: any;
    var tiModules: any;
    var branches: Branch;
    var key = 0;
    var tiKey = 0;

    //iterate through each module ID
    arrayOfModuleIDs.forEach(function (id) {

      uiModules = []; //holds all User Initiated Module Objects
      tiModules = []; //holds all Time Initiated Module Objects
      branchArray = []; //holds the branch logic of a current questions within a Module
      var questions: any; //holds the questions within a module
      //baseModule = {};
      branches = {}; //holds all branching logic of a current module
      //get the module in Firestore
      self.afs.firestore.doc('/Modules/'+ id).get().then(querySnapshot => {
        var modType = querySnapshot.data().type;
        var modName = querySnapshot.data().name;
        if (modType == "User Initiated")
        {
          questions = self.afs.firestore.doc('/Modules/'+ id).collection("Questions").get().then(function(querySnapshot) {
            var questionsArray = [];
            let that = self;
            //iterate through each question in the module
            querySnapshot.forEach(function(doc) {
                if (!that.allQuestions.includes(doc.id)){
                  that.allQuestions.push(doc.id);
                  that.storeQuestions(doc.id);
                }
                questionsArray.push(doc.id);
                //each question has it's own set (array) of branching logic
                var branch = doc.data().branch;
                branchArray = [];
                branch.forEach(function (id) {
                  branchArray.push(id);
                });
                var index = "" + doc.id;
                branches[index] = branchArray;
            });
            return questionsArray;
        });
        questions.then(async function(id) {
          var uiModule = {
              type: modType,
              questionIDs: id,
              branching: branches,
              name: modName
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
          questions = self.afs.firestore.doc('/Modules/'+ id).collection("Questions").get().then(function(querySnapshot) {
            var questionsArray = [];
            let that = self;
            //iterate through each question in the module
            querySnapshot.forEach(function(doc) {
                if (!that.allQuestions.includes(doc.id)){
                  that.allQuestions.push(doc.id);
                  that.storeQuestions(doc.id);
                }
                questionsArray.push(doc.id);
                //each question has it's own set (array) of branching logic
                var branch = doc.data().branch;
                branchArray = [];
                branch.forEach(function (id) {
                  branchArray.push(id);
                });
                var index = "" + doc.id;
                branches[index] = branchArray;
            });
            return questionsArray;
          });
        questions.then(async function(id) {
          var tiModule = {
              type: modType,
              questionIDs: id,
              branching: branches,
              name: modName
              // WILL NEED TO INPUT TIME INTERVAL
          };

          //push the created User Initiated module to the uiModules array
          tiModules.push(tiModule);
          var keyStorage = "TImod"+ tiKey++;
          //WILL NEED TO SCHEDULE NOTIFICATION
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
          questions = self.afs.firestore.doc('/Modules/'+ id).collection("Questions").get().then(function(querySnapshot) {
            var questionsArray = [];
            let that = self;
            //iterate through each question in the module
            querySnapshot.forEach(function(doc) {
                if (!that.allQuestions.includes(doc.id)){
                  that.allQuestions.push(doc.id);
                  that.storeQuestions(doc.id);
                }
                questionsArray.push(doc.id);
                //each question has it's own set (array) of branching logic
                var branch = doc.data().branch;
                branchArray = [];
                branch.forEach(function (id) {
                  branchArray.push(id);
                });
                var index = "" + doc.id;
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
              name: modName
          };
          localforage.setItem("base", base).then(function (value) {
          // Do other things once the value has been saved.
          console.log(value);
          //self.doSomethingElse();
          }).catch(function(err) {
              // This code runs if there were any errors
              console.log(err);
          });
        });
        }
        var branches = {};
      });
    });

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
        //self.doSomethingElse();
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
