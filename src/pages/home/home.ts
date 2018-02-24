import { NavController, ToastController } from 'ionic-angular';
import { AngularFireAuth } from "angularfire2/auth";
import { Component } from '@angular/core';
import { AlertController, Platform } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { Storage } from '@ionic/storage';
import { App } from 'ionic-angular';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { LocalNotifications } from '@ionic-native/local-notifications';
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

  constructor(private storage: Storage, private toast: ToastController,
    private plt: Platform, public alertCtrl: AlertController,
    public navCtrl: NavController, public appCtrl: App,
    public afs: AngularFirestore, private localNotifications: LocalNotifications) {
  }

  logout(){
    this.storage.remove('user');
    this.appCtrl.getRootNav().setRoot(LoginPage);
  }

  scheduleNotification() {
    cordova.plugins.notification.local.schedule({
      id: 1,
      title: 'Attention',
      text: 'Test Notification',
      data: { mydata: 'My hidden message' },
      at: new Date(new Date().getTime() + 6000)
    });
  }

  ionViewDidLoad() {
    try
    {
      this.storage.get('user').then((val) => {
        if (val)
        {
          this.toast.create({
            message: `Welcome to SCHEMA, ${val}`,
            duration: 2000
          }).present();

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
              console.log(doc.id, " => ", doc.data());
              localQuestions[counter] = doc.data().qtext;
              counter++;
          });
        });
        this.questions = localQuestions;
        }
      });
    }
    catch(e){
      console.error(e);
      this.navCtrl.setRoot(LoginPage);
    }
  }

}
