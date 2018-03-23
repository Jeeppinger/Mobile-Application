import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../pages/login/login';
import { TabsPage } from '../pages/tabs/tabs';
import { App } from 'ionic-angular';
import { ModulePage } from '../pages/module/module';
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
              splashScreen: SplashScreen, storage: Storage,
              appCtrl: App) {
    splashScreen.show();

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      //splashScreen.hide();
      //cordova.plugins.backgroundMode.enable();
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
        appCtrl.getRootNav().setRoot(ModulePage, {
          mID: '' + notification.data.notiID,
          type: 'Time Initiated'
        });
        }, this);

      cordova.plugins.notification.local.on("trigger", function(notification) {
        //will need to keep a queue of all the backlogs
        //backlogs will be cleared once the modules have been completed
        self.rescheduleModule(notification.data.notiID);
        //badge.increase(1);
      });


    });
  }

  rescheduleModule(id) {
    let self = this;

    localforage.getItem("sleep").then(function(value1) {
        var temp1: any = {};
        temp1 = value1;
        if (value1 == null){
          alert('failure1');
        }
        else {
          var test = new Date(new Date().getTime() + (2*60*1000));
          var today = test.getHours();

          self.sleep_start = temp1.sleep_start;
          self.sleep_end = temp1.sleep_end;

          if (today >= self.sleep_end && today <= self.sleep_start) {

            //time is valid
            cordova.plugins.notification.local.schedule({
              id: 1,
              title: 'Attention',
              text: 'Test Notification',
              data: { notiID: id,
                      every: 'hour'},
              //firstAt: monday,
              //every: "minute"
              at: new Date(new Date().getTime() + (2*60*1000)),
            });

          }

          else {

          }
        }
    }).catch(function(err) {
        // This code runs if there were any errors
        console.log(err);
    });

    localforage.getItem(id).then(function(value) {
        // This code runs once the value has been loaded
        // from the offline store.
        var temp: any = {};
        temp = value;
        if (value == null){
          alert('failure2');
        }
        else {
          if (temp.triggered == 'yes'){
            //we will need to send blank data to Firestore
            //this means a user has missed a log
          }
          else{
            temp.triggered = 'yes';
            localforage.setItem(id, temp);
          }
        }
    }).catch(function(err) {
        // This code runs if there were any errors
        console.log(err);
    });

  }
}
