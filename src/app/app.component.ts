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
          type: notification.data.type
        });
        }, this);

      cordova.plugins.notification.local.on("trigger", function(notification) {
        //will need to keep a queue of all the backlogs
        //backlogs will be cleared once the modules have been completed
        self.triggerModule(notification.data.notiID);
        cordova.plugins.notification.badge.increase(1, function (badge) {
          // increase badge
      });
      });


    });
  }

  triggerModule(id) {

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
