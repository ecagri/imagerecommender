import { db, auth} from './firebaseInit.js';
import { doc, getDoc, setDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js"
import { signInAnonymously } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";

signInAnonymously(auth).then(async () => {
    const docRef = doc(db, "Users", auth.currentUser.uid);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
        console.log("User is already exist.");
    }else{
        await setDoc(doc(db, "Users", auth.currentUser.uid), {
            "favourites": {},
            "likes": [],
            "dislikes": []
        })
    }
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ...
});

var number_of_images = (await getDoc(doc(db, "Images", "default"))).data().number_of_images;

var image = String(parseInt(Math.random() * number_of_images));

const docRefImage = doc(db, "Images", image);
var docSnapImage = await getDoc(docRefImage);

if (docSnapImage.exists()) {
  document.getElementById("centered-image").setAttribute('src', docSnapImage.data().path);
  getImageTags();


} else {
}

document.getElementById("like-btn").addEventListener("click", async function(){
  const docRefUser = doc(db, "Users", auth.currentUser.uid);
  const docSnapUser = await getDoc(docRefUser)
  const labels = docSnapImage.data().labels;

  if(docSnapUser.exists()){
    const favourites = new Map(Object.entries(docSnapUser.data().favourites));
    for(let i = 0; i < labels.length; i++){
      if(!favourites.has(labels[i])){
        favourites.set(labels[i], 1);
      }else{
        favourites.set(labels[i], favourites.get(labels[i]) + 1);
      }
    }
    const favouritesObject = {};
    favourites.forEach((value, key) => {
      favouritesObject[key] = value;
    });
    let likes = docSnapUser.data().likes || [];
    likes.push(image)
    await setDoc(doc(db, "Users", auth.currentUser.uid), {
      "favourites": favouritesObject,
      "likes": likes,
      "dislikes": docSnapUser.data().dislikes,
    })

  }
  image = String(parseInt(Math.random() * number_of_images));
  await getNextImage().then(async (result)=> {
    image = result;
    const docRefImage = doc(db, "Images", result);
    docSnapImage = await getDoc(docRefImage);
    if (docSnapImage.exists()) {
        getImageTags();

      document.getElementById("centered-image").setAttribute('src', docSnapImage.data().path);
    } else {
    }
  });
})

document.getElementById("dislike-btn").addEventListener("click", async function(){
  const docRefUser = doc(db, "Users", auth.currentUser.uid);
  const docSnapUser = await getDoc(docRefUser)
  const labels = docSnapImage.data().labels;

  if(docSnapUser.exists()){
    const favourites = new Map(Object.entries(docSnapUser.data().favourites));
    for(let i = 0; i < labels.length; i++){
      if(!favourites.has(labels[i])){
        favourites.set(labels[i], -1);
      }else{
        favourites.set(labels[i], favourites.get(labels[i]) - 1);
      }
    }
    const favouritesObject = {};
    favourites.forEach((value, key) => {
      favouritesObject[key] = value;
    });
    let dislikes = docSnapUser.data().dislikes || [];
    dislikes.push(image)
    await setDoc(doc(db, "Users", auth.currentUser.uid), {
      "favourites": favouritesObject,
      "likes": docSnapUser.data().likes,
      "dislikes": dislikes,
    })

  }
  await getNextImage().then(async (result)=> {
    image = result;
    const docRefImage = doc(db, "Images", String(result));
    docSnapImage = await getDoc(docRefImage);
    if (docSnapImage.exists()) {
        getImageTags();

      document.getElementById("centered-image").setAttribute('src', docSnapImage.data().path);
    } else {
    }
  });
})

document.getElementById("info-btn").addEventListener("click", function(){
    if(!document.getElementById("centered-image").hidden){
        document.getElementById("centered-image").style.transform = 'rotateY(90deg)';
        document.getElementById("centered-image").addEventListener("transitionend", function(){
            document.getElementById("centered-image").hidden = true;
            document.getElementById("contents_table").hidden = false;    
            document.getElementById("contents_table").style.transform = 'rotateY(-90deg)';
        });
    }
    else{
        document.getElementById("contents_table").style.transform = 'rotateY(0deg)';
        document.getElementById("contents_table").addEventListener("transitionend", function(){
            document.getElementById("contents_table").hidden = true;
            document.getElementById("centered-image").hidden = false;    
            document.getElementById("centered-image").style.transform = 'rotateY(0deg)';
        });
    }
})

async function getNextImage() {
  const docRefUser = doc(db, "Users", auth.currentUser.uid);
  const docSnapUser = await getDoc(docRefUser);
  const docRefImage = collection(db, "Images");
  const docSnapImages = await getDocs(docRefImage);

  const allImages = docSnapImages.docs.map((doc) => {
    return {
      id: doc.id,
      data: doc.data()
    };
  });


  if (docSnapUser.exists()) {
    const favourites = new Map(Object.entries(docSnapUser.data().favourites));
    let maxPoint = 0;
    let maxPointImageIndex = -1;

    for (let i = 0; i < number_of_images; i++) {
        let points = 0;
        const labels = allImages[i].data.labels;
        if(!docSnapUser.data().likes.includes(allImages[i].id) && !docSnapUser.data().dislikes.includes(allImages[i].id)){
          for (let j = 0; j < labels.length; j++) {
            if (favourites.has(labels[j])) { 
              points += favourites.get(labels[j]) * Math.random();
            }
          }
          if (points > maxPoint) {
            maxPoint = points;
            maxPointImageIndex = allImages[i].id;
          }
        }
    }
    getUserTags();

    if (maxPointImageIndex !== -1) {
      return String(maxPointImageIndex);
    } else {
      // Handle case when no valid images are found
      return String(parseInt(Math.random() * number_of_images)); // or throw an error or handle differently based on your requirements
    }
  }
}


async function getUserTags(){
    const docRefUser = doc(db, "Users", auth.currentUser.uid);
    const docSnapUser = await getDoc(docRefUser);
    const favourites = new Map(Object.entries(docSnapUser.data().favourites));
    const favouritesArray = [...favourites.entries()];
    favouritesArray.sort((a, b) => b[1] - a[1]);

    const top3Tags = favouritesArray.slice(0, 3);
    const last3Tags = favouritesArray.slice(-3);

    
    document.getElementById('Tag1Like').textContent = top3Tags[0][0];
    document.getElementById('Tag2Like').textContent = top3Tags[1][0];
    document.getElementById('Tag3Like').textContent = top3Tags[2][0];

    document.getElementById('Tag1Dislike').textContent = last3Tags[0][0];
    document.getElementById('Tag2Dislike').textContent = last3Tags[1][0];
    document.getElementById('Tag3Dislike').textContent = last3Tags[2][0];
}

getUserTags()

async function getImageTags(){
    var table = document.getElementById("contents_table");
    while (table.rows.length > 1) {
        table.deleteRow(table.rows.length - 1);
    }
    const docRefImage = doc(db, "Images", image);
    var docSnapImage = await getDoc(docRefImage);
    const labels = docSnapImage.data().labels;
    for(let i = 0; i < labels.length - 1; i+=2){
        var row = table.insertRow();
        var cell = row.insertCell(0);
        var cell1 = row.insertCell(1);
        cell.innerHTML = labels[i];
        cell1.innerHTML = labels[i + 1];
    }
}