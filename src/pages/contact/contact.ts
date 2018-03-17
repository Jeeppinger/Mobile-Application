import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AngularFirestore } from 'angularfire2/firestore';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  userInfo: {name: string, ans: any, email: string, phone: string} = {name: '', ans: '', email: '', phone: ''};
  questions: any;
  questionsType: any;
  qID: any;

  constructor(private navController: NavController,
    public afs: AngularFirestore, public navCtrl: NavController,
    private storage: Storage) {


    }

    resetQuestion(){
      try
      {
        this.afs.firestore.doc('/Questions/'+this.qID).get()
        .then(docSnapshot => {
          if (docSnapshot.exists) {
            // store qtext
            this.questionsType = docSnapshot.data().type;
            this.questions = docSnapshot.data().qtext;
          }
          else
          {
            this.questionsType = "Invalid";
            alert('Invalid Question ID');
          }
        });
      }
      catch (e) {
        this.questionsType = "Invalid";
        alert(e);
      }
    }

    submitQuestion(){
      //submit answer to database
      var data = {
        name: 'TEST',
        [this.questions]: this.userInfo.ans
      };
      var today = new Date();
      var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      var dateTime = date+' '+time;

      this.storage.get('user').then((val) => {
        if (val)
        {
          try
          {
            this.afs.firestore.doc('/Answers/'+val).collection("Modules").doc(dateTime).set(data);
          }
          catch (e) {
            //this.questionsType = "Unable to Store Answer";
            alert("Unable to Store Answer");
          }
        }
      });
    }

    ionViewDidLoad() {
      /*
      var counter = 0;
      var localQuestions = [];
      var localQuestionsType = [];
      //get all documents in a collection
      this.afs.firestore.collection("Questions").get().then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
          // doc.data() is never undefined for query doc snapshots
          console.log(doc.id, " => ", doc.data());
          localQuestions[counter] = doc.data().qtext;
          localQuestionsType[counter] = doc.data().type;
          counter++;
      });
    });
    this.questions = localQuestions;
    this.questionsType = localQuestionsType;
    */
    }

  }
