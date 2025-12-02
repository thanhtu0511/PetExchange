import { useUser } from "@clerk/clerk-expo";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useCallback, useState } from "react";
import { FlatList, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ExchangeCategoryItem from "../../components/Exchange/ExchangeCategoryItem";
import { db } from "../../Config/FirebaseConfig";

export default function ExchangeScreen() {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const navigation = useNavigation();

  const [petsRequested, setPetsRequested] = useState([]);
  const [myPets, setMyPets] = useState([]);

  // 🔹 Load Exchange mà người dùng tham gia + merge Pet info
  const loadPetsRequested = async () => {
    const q = query(
      collection(db, "Exchange"),
      where("userIDs", "array-contains", userEmail)
    );
    const snap = await getDocs(q);

    const merged = await Promise.all(
      snap.docs.map(async (ex) => {
        const data = ex.data();
        const petSnap = await getDoc(doc(db, "Pets", data.petId));
        const pet = petSnap.data();
        if (pet.email === userEmail || pet.exchangeStatus === "completed") return null;

        return {
          ...pet,
          id: data.petId,
          exchangeId: ex.id,
          exchangeStatus: data.exchangeStatus,
        };
      })
    );

    setPetsRequested(merged.filter(Boolean)); // loại null
  };

  const loadMyPets = async () => {
    try {
      const q = query(
        collection(db, "Pets"),
        where("email", "==", userEmail),
        where("exchangeStatus", "==", "pending")
      );
      const snap = await getDocs(q);

      const petsWithRequests = snap.docs.map(docSnap => docSnap.data());
      setMyPets(petsWithRequests);
    } catch (err) {
      console.log("Load myPets error:", err);
    }
  };

  // 🔹 Load data khi screen focus
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({ headerTitle: "Exchange" });
      loadPetsRequested();
      loadMyPets();
    }, [userEmail])
  );

  const CategoryList = [
    {
      id: 1,
      title: "Pets you requested",
      description: "Pets that you asked to exchange",
      count: petsRequested.length,
      pets: petsRequested,
      navigate: "/user-exchange/exchange-my-requests",
    },
    {
      id: 2,
      title: "Your pets received requests",
      description: "Users asked to adopt your pet",
      count: myPets.length,
      pets: myPets,
      navigate: "/user-exchange/exchange-pet-requests",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontFamily: "outfit-medium", fontSize: 28 }}>Exchange</Text>

      <FlatList
        data={CategoryList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ExchangeCategoryItem category={item} />}
        style={{ marginTop: 20 }}
      />
    </SafeAreaView>
  );
}
