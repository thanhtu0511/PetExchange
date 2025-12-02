import { useUser } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { db } from "../../Config/FirebaseConfig";
import ExchangePetItem from "../../components/Exchange/ExchangePetItem";
import Colors from "../../constants/Colors";

export default function ExchangePetRequests() {
  const navigation = useNavigation();
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const { title } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [petList, setPetList] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: title || "Received Requests",
    });
  }, [title]);

  // 🔹 Load Pets của user hiện tại mà đang có exchangeStatus = "pending"
  const loadMyPets = async () => {
    if (!userEmail) return;

    try {
      const q = query(
        collection(db, "Pets"),
        where("email", "==", userEmail),
        where("exchangeStatus", "==", "pending")
      );
      const snap = await getDocs(q);

      const petsWithRequests = snap.docs.map(docSnap => {
        const pet = docSnap.data();
        return {
          ...pet,
          id: docSnap.id, // để FlatList keyExtractor
        };
      });

      setPetList(petsWithRequests);
    } catch (err) {
      console.log("Load myPets error:", err);
    }
  };

  // 🔹 useEffect để load lần đầu với loading spinner
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      await loadMyPets();
      setLoading(false);
    };
    fetch();
  }, []);

  // 🔹 Pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyPets();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontFamily: "outfit-medium", fontSize: 26 }}>
        {title || "Received Requests"}
      </Text>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={{ marginTop: 10, fontFamily: "outfit" }}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={petList}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={({ item }) => <ExchangePetItem pet={item} navigateToRequests={true} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.PRIMARY}
            />
          }
          style={{ marginTop: 15 }}
          ListEmptyComponent={
            <Text style={{ fontFamily: "outfit", textAlign: "center", marginTop: 20 }}>
              No received requests yet
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
