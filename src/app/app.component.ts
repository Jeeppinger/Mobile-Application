import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../pages/login/login';
import { TabsPage } from '../pages/tabs/tabs';
import { App } from 'ionic-angular';
import { ModulePage } from '../pages/module/module';
import { AngularFirestore } from 'angularfire2/firestore';
import * as localforage from "localforage";
declare var cordova;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;
  cordova: any;
  sleep_start: any;
  sleep_end: any;

  constructor(platform: Platform, statusBar: StatusBar,
              splashScreen: SplashScreen, public storage: Storage,
              appCtrl: App, public afs: AngularFirestore) {
    splashScreen.show();

    platform.ready().then(() => {

      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      //splashScreen.hide();
      let self = this;
      try
      {
        storage.get('user').then((val) => {
          if (val)
          {
            //logged in
            self.rootPage = TabsPage;
          }
          else
          {
            //not logged in
            self.rootPage = LoginPage;
          }
        });
      }
      catch(e){
        splashScreen.hide();
        console.error(e);
      }

      cordova.plugins.notification.local.on("click", function (notification, state) {
        //the notification has been clicked
        //we will need to set the page to the module page and start
        //the module with the given module id
        //we will need to get the module ID
        if (notification.data.notiID != "1day"){
        appCtrl.getRootNav().setRoot(ModulePage, {
          mID: '' + notification.data.notiID,
          type: notification.data.type
        });
      }

      }, this);

      cordova.plugins.notification.local.on("trigger", function(notification) {
        //will need to keep a queue of all the backlogs
        //backlogs will be cleared once the modules have been completed
        if (notification.data.notiID != "1day"){
        self.triggerModule(notification.data.notiID);
        cordova.plugins.notification.badge.increase(1, function (badge) {
          // increase badge
        });
      }
      });


    });
  }

  triggerModule(id) {
    let self = this;
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;

    localforage.getItem(id).then(function(value) {
        // This code runs once the value has been loaded
        // from the offline store.
        var temp: any = {};
        temp = value;
        if (value == null){
          //alert('failure2');
        }
        else {
          if (temp.triggered == 'yes'){
            //we will need to send blank data to Firestore
            //this means a user has missed a log
            self.submitModule(id);
          }
          else{
            temp.triggered = 'yes';
            temp.triggeredAt = dateTime;
            localforage.setItem(id, temp);
          }

        }
    }).catch(function(err) {
        // This code runs if there were any errors
        console.log(err);
    });

  }

  submitModule(mID){
    //submit answer to database

    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
    var originalDateTime = dateTime;
    let self = this;
    var modKey: any;

    this.storage.get('user').then((val) => {
      if (val)
      {
        try
        {
          localforage.getItem(mID).then(function(value) {
              // This code runs once the value has been loaded
              // from the offline store.
              var temp: any = {};
              temp = value;

              var firestoreID = temp.name;
              var triggeredAt = temp.triggeredAt;
              dateTime = triggeredAt + " => " + "null";
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
                    var answer = {ans: "null"};
                    that.afs.firestore.doc('/Answers/'+val).collection(firestoreID).doc(dateTime).set(answer);
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
                    var answer = {ans: "null"};
                    that.afs.firestore.doc('/Answers/'+val).collection(firestoreID).doc(dateTime).set(answer);
                  }
                  temp.triggeredAt = originalDateTime;
                  localforage.setItem(mID, temp);
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
  }
}
