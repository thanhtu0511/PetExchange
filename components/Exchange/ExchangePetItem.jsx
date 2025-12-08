import { useRouter } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../Config/FirebaseConfig";
import Colors from "../../constants/Colors";
export default function ExchangePetItem({ pet, navigateToRequests = false }) {
  const router = useRouter();

  const handlePress = () => {
    if (navigateToRequests) {
      router.push({
        pathname: "/user-exchange/pet-requests-details",
        params: pet,
      });
    } else {
      router.push({
        pathname: "/pet-details",
        params: pet,
      });
    }
  };
  // cofirm cancel
  const confirmCancel = () => {
    Alert.alert(
      "Cancel Exchange Request",
      "Are you sure you want to cancel this request?",
      [
        { text: "No" },
        { text: "Yes", onPress: () => cancelRequest() },
      ]
    );
  };

  const cancelRequest = async () => {
    try {
      const exchangeId = pet.exchangeId;
      const petId = pet.id;

      await deleteDoc(doc(db, "Exchange", exchangeId));

      const q = query(collection(db, "Exchange"), where("petId", "==", petId));
      const snap = await getDocs(q);

      if (snap.empty) {
        await updateDoc(doc(db, "Pets", petId), {
          exchangeStatus: "available",
        });
      }

      Alert.alert("Success", "Exchange request cancelled.");
    } catch (e) {
      console.log("Cancel Error:", e);
      Alert.alert("Error", "Something went wrong.");
    }
  };
  return (
    <View
      style={{
        padding: 12,
        backgroundColor: Colors.WHITE,
        borderRadius: 15,
        marginBottom: 16,
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        style={{ flexDirection: "row" }}
      >
        <Image
          source={{ uri: pet.imageUrl }}
          style={{ width: 85, height: 85, borderRadius: 12 }}
        />
        <View style={{ flex: 1, marginLeft: 12, justifyContent: "center" }}>
          <Text style={{ fontFamily: "outfit-medium", fontSize: 17 }}>
            {pet.name}
          </Text>
          <Text
            style={{
              fontFamily: "outfit",
              color: Colors.GRAY,
              marginTop: 2,
            }}
          >
            Status: {pet.exchangeStatus || "available"}
          </Text>
        </View>
      </TouchableOpacity>

      {!navigateToRequests && (
        <TouchableOpacity
          onPress={confirmCancel}
          style={{
            marginTop: 10,
            paddingVertical: 8,
            backgroundColor: Colors.PRIMARY,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: Colors.WHITE,
              fontFamily: "outfit-medium",
            }}
          >
            Cancel Request
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
