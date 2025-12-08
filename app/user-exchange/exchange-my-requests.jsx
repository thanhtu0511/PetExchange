import { useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ExchangePetItem from "../../components/Exchange/ExchangePetItem";
import { db } from "../../Config/FirebaseConfig";
import Colors from "../../constants/Colors";

export default function ExchangeMyRequests() {
  const { title } = useLocalSearchParams();
  const navigation = useNavigation();
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [petList, setPetList] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: title || "My Requests",
    });
  }, [title]);

  const loadData = async () => {
    if (!userEmail) return;
    try {
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

          if (pet.exchangeStatus === "completed" || pet.email === userEmail) return null;

          return {
            ...pet,
            id: data.petId,
            exchangeId: ex.id,
            exchangeStatus: data.exchangeStatus || "Pending",
          };
        })
      );

      setPetList(merged.filter(Boolean));
    } catch (e) {
      console.log("Load My Requests Error:", e);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    fetch();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontFamily: "outfit-medium", fontSize: 26 }}>
        {title}
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
          renderItem={({ item }) => (
            <ExchangePetItem pet={item} navigateToRequests={false} />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.PRIMARY}
            />
          }
          style={{ marginTop: 15 }}
          ListEmptyComponent={
            <Text style={{ fontFamily: "outfit", marginTop: 20, textAlign: "center" }}>
              No exchange requests found
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
