import { db, auth } from './firebaseInit.js';
import { doc, getDoc} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js"
import { signInAnonymously } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";


signInAnonymously(auth).then(async () => {
  const docRef = doc(db, "Users", auth.currentUser.uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data().favourites);
    const favTagsMap = docSnap.data().favourites;
    var data = {
        labels: [],
        datasets: [{
          label: 'YOUR FAVOURITE TAGS',
          data: [],
          backgroundColor: 'rgba(75, 192, 192, 0.2)', // Color for the bars
          borderColor: 'rgba(75, 192, 192, 1)', // Border color for the bars
          borderWidth: 1
        }]
    };
    Object.keys(favTagsMap).forEach((tagKey) => {
        const tagValue = favTagsMap[tagKey];
        data.labels.push(tagKey);
        data.datasets[0].data.push(tagValue);
        console.log(`Tag: ${tagKey}, Value: ${tagValue}`);
      });
    var ctx = document.getElementById('myHistogram').getContext('2d');

      // Create a new histogram using Chart.js
    var myHistogram = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
    });
  }else {
  }
})
.catch((error) => {
  const errorCode = error.code;
  const errorMessage = error.message;
  // ...
});

