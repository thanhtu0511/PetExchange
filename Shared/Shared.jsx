import { arrayRemove, arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './../Config/FirebaseConfig';

const GetFavList = async (user) => {
  const docSnap = await getDoc(doc(db, 'UserFavPet', user?.primaryEmailAddress?.emailAddress));
  if (docSnap?.exists()) {
    return docSnap.data();
  } else {
    await setDoc(doc(db, 'UserFavPet', user?.primaryEmailAddress?.emailAddress), {
      email: user?.primaryEmailAddress?.emailAddress,
      favorites: [],
    });
    return { favorites: [] };
  }
};

// Thêm vào favorites
const AddToFav = async (user, petId) => {
  const docRef = doc(db, 'UserFavPet', user?.primaryEmailAddress?.emailAddress);
  await updateDoc(docRef, {
    favorites: arrayUnion(petId),
  });
};

// Xóa khỏi favorites
const RemoveFromFav = async (user, petId) => {
  const docRef = doc(db, 'UserFavPet', user?.primaryEmailAddress?.emailAddress);
  await updateDoc(docRef, {
    favorites: arrayRemove(petId),
  });
};

export default {
  GetFavList,
  AddToFav,
  RemoveFromFav,
};
