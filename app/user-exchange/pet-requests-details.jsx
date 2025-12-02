import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useLayoutEffect, useState } from "react";
import { FlatList, SafeAreaView, ScrollView, Text } from "react-native";
import { db } from "../../Config/FirebaseConfig";
import UserRequestItem from "../../components/Exchange/UserRequestItem";
import PetInfo from "../../components/PetDetails/PetInfo";
import Colors from "../../constants/Colors";
export default function PetRequestsDetails() {
  const pet = useLocalSearchParams(); // chỉ có dữ liệu cơ bản
  const [exchangeRequests, setExchangeRequests] = useState([]);
  const navigation = useNavigation();
    useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: '',
    });
  });
  useEffect(() => {
    const loadExchangeRequests = async () => {
      try {
        const q = query(
          collection(db, "Exchange"),
          where("petId", "==", pet.id),
          where("exchangeStatus", "==", "pending")
        );
        const snap = await getDocs(q);

        const requests = snap.docs.flatMap(d => {
          const data = d.data();
          return data.users.filter(u => u.email !== pet.email);
        });

        setExchangeRequests(requests);
      } catch (err) {
        console.log("Load exchangeRequests error:", err);
      }
    };

    loadExchangeRequests();
  }, [pet.id]);

  const RenderStatus = () => {
    const s = pet.exchangeStatus;
    let label = '⭕ Available';
    let color = '#15a300';

    if (s === 'pending') { label = '🟡 Waiting for exchange'; color = '#d5a100'; }
    if (s === 'exchanged') { label = '🟢 Successfully exchanged'; color = '#0a8a00'; }

    return <Text style={{ marginLeft: 20, marginTop: 5, fontSize: 18, color }}>{label}</Text>;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <PetInfo pet={pet} />

        <Text style={{ fontSize: 22, marginLeft: 20 }}>
            <Text style={{ fontFamily: 'outfit-medium', color: '#000' }}>Price: </Text>
                <Text style={{ fontFamily: 'outfit-medium', color: Colors.PRIMARY }}>
                    {pet?.price && Number(pet?.price) !== 0 ? `${Number(pet?.price).toLocaleString()} đ` : 'Free'}
                </Text>
        </Text>

        <RenderStatus />

        <Text style={{ fontSize: 22, marginLeft: 20, fontFamily: 'outfit-medium' }}>
          Users requested this pet
        </Text>
        <FlatList
            style={{ fontSize: 22, padding:20, marginBottom:10 }}
            data={exchangeRequests}
            keyExtractor={(item) => item.email}
            renderItem={({ item }) => (
                <UserRequestItem pet={pet} user={item} />
            )}
            scrollEnabled={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
