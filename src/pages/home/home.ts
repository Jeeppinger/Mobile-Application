import { NavController, ToastController, NavParams } from 'ionic-angular';
import { Component } from '@angular/core';
import { AlertController, Platform } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { ModulePage } from '../module/module';
import { AboutPage } from '../about/about';
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
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  cordova: any;
  participantsCollectionRef:any;
  participants: any;

  questionsCollectionRef: AngularFirestoreCollection<Question>;
  questions: any;
  userInitiatedModules: any;
  done: any;
  studyEnded: any = '';
  endModuleExists: any = '';

  constructor(public storage: Storage, private toast: ToastController,
    public alertCtrl: AlertController,
    public navCtrl: NavController, public appCtrl: App,
    public afs: AngularFirestore, public splashScreen: SplashScreen,
    public navParams: NavParams) {
  }


  startModule(id){
    //we will need to get the module ID
    let modID = '' + id;
    this.appCtrl.getRootNav().setRoot(ModulePage, {
      mID: modID,
      type: 'User Initiated'
    });
  }

  logout(){
    
    this.storage.remove('user');
    this.storage.remove('study_id');

    cordova.plugins.notification.local.cancelAll(function() {
        //console.log('Notifications cancelled. ');
    }, this);
    cordova.plugins.notification.badge.clear();

    localforage.clear().then(function() {
    // Run this code once the database has been entirely deleted.
    console.log('Database is now empty.');
    }).catch(function(err) {
        // This code runs if there were any errors
        console.log(err);
    });
    this.appCtrl.getRootNav().setRoot(LoginPage);
  }

  finalModule(){
    this.appCtrl.getRootNav().setRoot(ModulePage, {
      mID: "end",
      type: 'End Module'
    });
  }

  goToAbout(){
    this.appCtrl.getRootNav().setRoot(AboutPage);
  }

  initializeModules(){
    var counter = 0;
    this.done = 'false';
    var key;
    let self = this;
    this.userInitiatedModules = [];

    //see if end date of study is reached
    localforage.getItem("end_date").then(function(value) {
        // This code runs once the value has been loaded
        // from the offline store.
        if (value == null){
          // no end date
        }
        else {
          var date:any = value;
          var today = new Date();
          var end:any = new Date(date);
          end.setDate(end.getDate()+1);
          if (today.getTime() > end.getTime())
          {
              self.done = 'true';
              self.studyEnded = 'true';
              let that = self;
              localforage.getItem("end").then(function(value1) {
                if (value1 == null){
                  that.endModuleExists = 'false';
                }
                else{
                  var temp1: any = {};
                  temp1 = value1;
                  if (temp1.completed == 'yes'){
                    that.endModuleExists = 'false';
                  }
                  else{
                    that.endModuleExists = 'true';
                  }
                }
              }).catch(function(err) {
                  // This code runs if there were any errors
                  console.log(err);
              });
          }
        }
    }).catch(function(err) {
        // This code runs if there were any errors
        console.log(err);
    });

    while (this.done == 'false' && counter < 10){
      key = "UImod" + counter;
      localforage.getItem(key).then(function(value) {
          // This code runs once the value has been loaded
          // from the offline store.
          if (value == null){
            self.done = 'true';
          }
          else {
            self.userInitiatedModules.push(value);
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
    try
    {
      this.storage.get('user').then((val) => {
        if (val)
        {

          let toast = this.toast.create({
            message: `Welcome! \nYá'át'ééh!`,
            duration: 3500,
            position: 'top'
          });
          toast.present();

          //get a specific document within a collection
          this.participantsCollectionRef = this.afs.firestore.doc('/Participants/'+val).get()
          .then(docSnapshot => {
            if (docSnapshot.exists) {
              //this.participants = docSnapshot.data();
              this.participants = docSnapshot.data().Name;
            }
          });

          var counter = 0;
          var localQuestions = [];

          //get all documents in a collection
          this.afs.firestore.collection("Questions").get().then(function(querySnapshot) {
          querySnapshot.forEach(function(doc) {
              // doc.data() is never undefined for query doc snapshots
              localQuestions[counter] = doc.data().qtext;
              counter++;
          });
        });

        let that = this;
        localforage.ready().then(function() {
            // This code runs once localforage
            // has fully initialized the selected driver.
            that.initializeModules();
        }).catch(function (e) {
            console.log(e); // `No available storage method found.`
            // One of the cases that `ready()` rejects,
            // is when no usable storage driver is found
        });
        this.questions = localQuestions;
        this.splashScreen.hide();
        }
        else
        {
          //this.appCtrl.getRootNav().setRoot(LoginPage);
          this.navCtrl.setRoot(LoginPage);
        }
        //this.splashScreen.hide();
      });

    }
    catch(e){
      console.error(e);
      //this.navCtrl.setRoot(LoginPage);
      this.appCtrl.getRootNav().setRoot(LoginPage);
    }
  }

}
