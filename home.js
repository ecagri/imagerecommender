import { app, db } from './firebaseInit.js';
import { doc, getDoc, setDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js"

var username = localStorage.getItem("username");
if(username == null){
  window.location.href = "index.html";
}

var number_of_images = (await getDoc(doc(db, "Images", "default"))).data().number_of_images;

var image = String(parseInt(Math.random() * number_of_images));

const docRefImage = doc(db, "Images", image);
var docSnapImage = await getDoc(docRefImage);

if (docSnapImage.exists()) {
  document.getElementById("centered-image").setAttribute('src', docSnapImage.data().path);
} else {
}

document.getElementById("like-btn").addEventListener("click", async function(){
  const docRefUser = doc(db, "Users", username);
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
    await setDoc(doc(db, "Users", username), {
      "favourites": favouritesObject,
      "likes": likes,
      "dislikes": docSnapUser.data().dislikes,
      "password": docSnapUser.data().password
    })

  }
  image = String(parseInt(Math.random() * number_of_images));
  await getNextImage().then(async (result)=> {
    image = result;
    const docRefImage = doc(db, "Images", result);
    docSnapImage = await getDoc(docRefImage);
    if (docSnapImage.exists()) {
      document.getElementById("centered-image").setAttribute('src', docSnapImage.data().path);
    } else {
    }
  });
})

document.getElementById("dislike-btn").addEventListener("click", async function(){
  const docRefUser = doc(db, "Users", username);
  const docSnapUser = await getDoc(docRefUser)

  if(docSnapUser.exists()){
    let dislikes = docSnapUser.data().dislikes || [];
    dislikes.push(image)
    await setDoc(doc(db, "Users", username), {
      "favourites": docSnapUser.data().favourites,
      "likes": docSnapUser.data().likes,
      "dislikes": dislikes,
      "password": docSnapUser.data().password
    })

  }
  await getNextImage().then(async (result)=> {
    image = result;
    const docRefImage = doc(db, "Images", String(result));
    docSnapImage = await getDoc(docRefImage);
    if (docSnapImage.exists()) {
      document.getElementById("centered-image").setAttribute('src', docSnapImage.data().path);
    } else {
    }
  });
})


async function getNextImage() {
  const docRefUser = doc(db, "Users", username);
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
              points += favourites.get(labels[j]);
            }
          }
          if (points > maxPoint) {
            maxPoint = points;
            maxPointImageIndex = allImages[i].id;
          }
        }
    }

    if (maxPointImageIndex !== -1) {
      return String(maxPointImageIndex);
    } else {
      // Handle case when no valid images are found
      return String(parseInt(Math.random() * number_of_images)); // or throw an error or handle differently based on your requirements
    }
  }
}


