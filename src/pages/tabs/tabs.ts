import { Component } from '@angular/core';

import { AboutPage } from '../about/about';
import { BacklogPage } from '../backlog/backlog';
import { HomePage } from '../home/home';
import { Platform } from 'ionic-angular';

import * as localforage from "localforage";

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = AboutPage;
  tab3Root = BacklogPage;

  badgeCount: any = 0;
  done: any;

  constructor(platform: Platform) {
    let self = this;
    platform.ready().then(() => {
      self.setBadge();
    });
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
}
