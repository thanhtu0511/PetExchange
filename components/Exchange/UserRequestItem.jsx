import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../Config/FirebaseConfig";
import Colors from "../../constants/Colors";

export default function UserRequestItem({ pet, user }) {

  const handleAccept = async () => {
    Alert.alert("Confirm", "Accept this exchange?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: async () => {
          const petRef = doc(db, "Pets", pet.id);
          await updateDoc(petRef, {
            email: user.email,
            userImage: user.imageUrl,
            username: user.name,
            exchangeStatus: "completed",
          });

          const q = query(collection(db, "Exchange"), where("petId", "==", pet.id));
          const snap = await getDocs(q);
          snap.forEach(async (d) => {
            const data = d.data();
            await updateDoc(d.ref, {
              exchangeStatus: data.users[0].email === user.email ? "accepted" : "rejected",
            });
          });

          Alert.alert("Success", "Exchange completed!");
        },
      },
    ]);
  };

  const handleReject = async () => {
  Alert.alert("Reject", "Are you sure?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "OK",
      onPress: async () => {
        // 1️⃣ Update document của user này
        const q = query(collection(db, "Exchange"), where("petId", "==", pet.id));
        const snap = await getDocs(q);

        let remainingPending = 0;

        for (const d of snap.docs) {
          const data = d.data();
          if (data.users[0].email === user.email) {
            await updateDoc(d.ref, { exchangeStatus: "rejected" });
          } else if (data.exchangeStatus === "pending") {
            remainingPending++;
          }
        }

        // 2️⃣ Nếu không còn request nào pending → reset pet
        if (remainingPending === 0) {
          const petRef = doc(db, "Pets", pet.id);
          await updateDoc(petRef, {
            exchangeStatus: "available",
          });
        }

        Alert.alert("Rejected", "Exchange request rejected.");
      },
    },
  ]);
};


  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        marginBottom: 12,
        backgroundColor: Colors.WHITE,
        borderRadius: 14,
      }}
    >
      {/* Avatar */}
      <Image
        source={{ uri: user.imageUrl }}
        style={{ width: 50, height: 50, borderRadius: 25, marginRight: 12 }}
      />

      {/* Name + Buttons */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: "outfit-medium", fontSize: 16 }}>{user.name}</Text>

        <View style={{ flexDirection: "row", marginTop: 8 }}>
          <TouchableOpacity
            onPress={handleAccept}
            style={{
              flex: 1,
              backgroundColor: Colors.PRIMARY,
              paddingVertical: 8,
              borderRadius: 8,
              marginRight: 8, // khoảng cách giữa 2 nút
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontFamily: "outfit-medium" }}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleReject}
            style={{
              flex: 1,
              backgroundColor: Colors.RED,
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontFamily: "outfit-medium" }}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
