import { NavController, ToastController, NavParams } from 'ionic-angular';
import { Component } from '@angular/core';
import { AlertController, Platform } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { ModulePage } from '../module/module';
import { Storage } from '@ionic/storage';
import { App } from 'ionic-angular';
import { AngularFirestore } from 'angularfire2/firestore';
import 'rxjs/add/operator/map';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFirestoreCollection } from 'angularfire2/firestore';
import * as localforage from "localforage";
declare var cordova;

export interface Question {
  name:string;
  qtext:string;
  type:string;
}



@Component({
  selector: 'page-backlog',
  templateUrl: 'backlog.html'
})
export class BacklogPage {
  cordova: any;
  participantsCollectionRef:any;
  participants: any;

  questionsCollectionRef: AngularFirestoreCollection<Question>;
  questions: any;
  timeInitiatedModules: any;
  done: any;

  constructor(public storage: Storage, private toast: ToastController,
    public alertCtrl: AlertController,
    public navCtrl: NavController, public appCtrl: App,
    public afs: AngularFirestore, public splashScreen: SplashScreen,
    public navParams: NavParams) {
  }


  startModule(id){
    //we will need to get the module ID
    let modID = this.timeInitiatedModules[id].id;
    this.appCtrl.getRootNav().setRoot(ModulePage, {
      mID: modID,
      type: 'Time Initiated'
    });
  }

  initializeModules(){
    var counter = 0;
    this.done = 'false';
    var key;
    let self = this;
    this.timeInitiatedModules = [];

    while (this.done == 'false' && counter < 10){
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
                self.timeInitiatedModules.push(value);
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

  ionViewDidLoad() {
    this.initializeModules();
    if (this.timeInitiatedModules.length == 0)
    {
      //clear badge because no backlog
      //this.badge.clear();
    }
}
}
