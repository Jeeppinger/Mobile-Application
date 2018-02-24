import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FormGroup, FormBuilder, FormControl, Validators} from "@angular/forms";
import { AngularFirestore } from 'angularfire2/firestore';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  myForm: FormGroup;
  userInfo: {name: string, ans: any, email: string, phone: string} = {name: '', ans: '', email: '', phone: ''};
  questions: any;
  questionsType: any;
  qID: any;

  constructor(private navController: NavController, private fb: FormBuilder,
    public afs: AngularFirestore, public navCtrl: NavController) {


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
      alert(this.userInfo.ans);
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
