import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { TabsPage } from '../tabs/tabs';

export interface Participant {
  id:string;
}

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  //participantsCollectionRef: AngularFirestoreCollection<Participant>;
  participantsCollectionRef:any;
  user:any;
  participants: Observable<any[]>;

  constructor(public afAuth: AngularFireAuth, public afs: AngularFirestore,
    public navCtrl: NavController, public navParams: NavParams,
    public storage: Storage) {
  }

  async login(){
    try
    {
      this.participantsCollectionRef = this.afs.firestore.doc('/Participants/'+this.user).get()
      .then(docSnapshot => {
        if (docSnapshot.exists) {
          this.storage.set('user', this.user);
          this.navCtrl.setRoot(TabsPage);
        }
        else
        {
          alert('Invalid Login');
        }
      });
    }
    catch (e) {
      alert(e);
    }
  }

  ionViewDidLoad() {
    try
    {
      this.storage.get('user').then((val) => {
        if (val)
        {
          this.navCtrl.setRoot(TabsPage);
        }
  });
    }
    catch(e){
      console.error(e);
    }
  }
}
