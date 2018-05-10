import { Component } from '@angular/core';
import { NavController, ToastController, NavParams } from 'ionic-angular';
import { ConnectPage } from '../connect/connect';
import { BacklogPage } from '../backlog/backlog';
import { HomePage } from '../home/home';
import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import * as localforage from "localforage";

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = ConnectPage;
  tab3Root = BacklogPage;

  badgeCount: any = 0;
  done: any;

  constructor(platform: Platform, private toast: ToastController,
              public navCtrl: NavController,public navParams: NavParams,
              public storage: Storage) {

  }

  setBadge() {
    var counter = 0;
    this.done = 'false';
    var key;
    let self = this;

    localforage.getItem("base").then(function(value) {
        // This code runs once the value has been loaded
        // from the offline store.
        var temp: any = {};
        temp = value;
        if (value == null){
          //no base
        }
        else {
          if (temp.completed == 'no'){
              self.badgeCount++;
          }
        }
    }).catch(function(err) {
        // This code runs if there were any errors
        console.log(err);
        //error
    });

    while (this.done == 'false' && counter < 20){
      key = "TImod" + counter;
      localforage.getItem(key).then(function(value) {
          // This code runs once the value has been loaded
          // from the offline store.
          var temp: any = {};
          temp = value;
          if (value == null){
            self.done = 'true';
          }
          else {
            if (temp.triggered == 'yes'){
                self.badgeCount++;
            }
          }
      }).catch(function(err) {
          // This code runs if there were any errors
          console.log(err);
          self.done = 'true';
      });
      counter++;
    }
}
  ionViewDidLoad(){
    this.setBadge();
    try
    {
      var comingBackFromModule = this.navParams.get("module");
      this.storage.get('user').then((val) => {
        if (val)
        {
          if (comingBackFromModule != "true")
          {
            let toast = this.toast.create({
              message: `Welcome! \nYá'át'ééh!`,
              duration: 3500,
              position: 'top'
            });
            toast.present();
          }
        }
        else
        {
          //error
        }
      });

    }
    catch(e){
      console.error(e);
    }
  }
}
