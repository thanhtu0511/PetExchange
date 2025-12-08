import { useUser } from '@clerk/clerk-expo';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AboutPet from '../../components/PetDetails/AboutPet';
import OwnerInfo from '../../components/PetDetails/OwnerInfo';
import PetInfo from '../../components/PetDetails/PetInfo';
import PetSubInfo from '../../components/PetDetails/PetSubInfo';
import { db } from '../../Config/FirebaseConfig';
import Colors from '../../constants/Colors';

export default function PetDetails() {
  const pet = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const ownerEmail = pet?.email;
  const petId = pet?.id;
  useEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: '',
    });
  });


  /** EXCHANGE FUNCTION */
  const HandleExchange = async () => {
  try {
    const q = query(
      collection(db, "Exchange"),
      where("petId", "==", petId),
      where("userIDs", "array-contains", userEmail),
      where("exchangeStatus", "==", "pending")
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      Alert.alert(
        "Đang chờ phê duyệt",
        "Bạn đã gửi yêu cầu exchange rồi. Vui lòng chờ chủ pet phản hồi!"
      );
      return;
    }

    // Nếu chưa request → tiến hành xác nhận
    Alert.alert(
    'Confirm Exchange',
    'Do you want to request exchange for this pet?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: async () => {
          try {
            // 1️⃣ Cập nhật trạng thái pet
            const petRef = doc(db, 'Pets', pet.id);
            await setDoc(
              petRef,
              { exchangeStatus: "pending" },
              { merge: true }
            );

            // 2️⃣ Tạo Exchange collection
            const exchangeId =pet?.id + '_' + user?.primaryEmailAddress?.emailAddress;
            await setDoc(doc(db, 'Exchange', exchangeId), {
              id: exchangeId,
              petId: pet.id,
              exchangeStatus: "pending",
              users: [
                {
                  email: user?.primaryEmailAddress?.emailAddress,
                  name: user?.fullName,
                  imageUrl: user?.imageUrl,
                },
                {
                  email: pet?.email,
                  name: pet?.username,
                  imageUrl: pet?.userImage,
                },
              ],
              userIDs: [user?.primaryEmailAddress?.emailAddress, pet?.email],
            });

            // 3️⃣ Tạo Chat nếu chưa có
            const chatId1 = user?.primaryEmailAddress?.emailAddress + '_' + pet?.email;
            const chatId2 = pet?.email + '_' + user?.primaryEmailAddress?.emailAddress;
            const q = query(collection(db, 'Chat'), where('id', 'in', [chatId1, chatId2]));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.docs.length === 0) {
              await setDoc(doc(db, 'Chat', chatId1), {
                id: chatId1,
                users: [
                  {
                    email: user?.primaryEmailAddress?.emailAddress,
                    name: user?.fullName,
                    imageUrl: user?.imageUrl,
                  },
                  {
                    email: pet?.email,
                    name: pet?.username,
                    imageUrl: pet?.userImage,
                  },
                ],
                userIDs: [user?.primaryEmailAddress?.emailAddress, pet?.email],
              });
              router.push({ pathname: '/chat', params: { id: chatId1 } });
            } else {
              router.push({ pathname: '/chat', params: { id: querySnapshot.docs[0].id } });
            }
          } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Something went wrong.');
          }
        },
      },
    ]
  );
  } catch (error) {
    console.log("HandleExchange Error:", error);
  }
};


  /** STATUS LABEL */
  const RenderStatus = () => {
    const s = pet?.exchangeStatus;
    let label = 'Pending Approval';
    let color = '#15a300';
    if (s === 'available') { label = '⭕ Available'; color = '#15a300'; }
    if (s === 'pending') { label = '🟡 Waiting for exchange'; color = '#d5a100'; }
    if (s === 'completed') { label = '🟢 Successfully exchanged'; color = '#0a8a00'; }

    return <Text style={{ marginLeft: 20, marginTop: 5, fontSize: 18, color }}>{label}</Text>;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View>
        <ScrollView>
          <PetInfo pet={pet} />

          {/* PRICE */}
          <Text style={{ fontSize: 22, marginLeft: 20 }}>
            <Text style={{ fontFamily: 'outfit-medium', color: '#000' }}>Price: </Text>
            <Text style={{ fontFamily: 'outfit-medium', color: Colors.PRIMARY }}>
              {pet?.price && Number(pet?.price) !== 0 ? `${Number(pet?.price).toLocaleString()} đ` : 'Free'}
            </Text>
          </Text>

          {/* STATUS */}
          <RenderStatus />

          <PetSubInfo pet={pet} />
          <AboutPet pet={pet} />
          <OwnerInfo pet={pet} />

          <View style={{ height: 70 }}></View>
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            onPress={userEmail === ownerEmail ? () => Alert.alert('You own this pet', 'Exchange requests management coming soon...') : HandleExchange}
            style={styles.adpotBtn}
          >
            <Text style={styles.btnText}>
              {userEmail === ownerEmail ? 'My Pet' : 'Exchange and Pet Me'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  adpotBtn: {
    padding: 15,
    backgroundColor: Colors.PRIMARY,
  },
  btnText: {
    textAlign: 'center',
    fontFamily: 'outfit-medium',
    fontSize: 20,
    color: '#fff',
  },
  bottomContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
  },
});
