import { useUser } from '@clerk/clerk-expo';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { addDoc, collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../Config/FirebaseConfig';
import Colors from '../../constants/Colors';

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const { user } = useUser();
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);

  const GetUserDetails = async () => {
    const docRef = doc(db, 'Chat', params?.id);
    const docSnap = await getDoc(docRef);
    const result = docSnap.data();

    const otherUser = result?.users.filter(
      (item) => item.email !== user?.primaryEmailAddress?.emailAddress,
    );

    navigation.setOptions({
      headerTitle: otherUser?.[0]?.name || 'Chat',
    });
  };

  useFocusEffect(
    useCallback(() => {
      let unsubscribe;

      const loadMessages = async () => {
        await GetUserDetails();

        const ref = collection(db, 'Chat', params?.id, 'Messages');
        unsubscribe = onSnapshot(ref, (snapshot) => {
          const messageData = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              _id: docSnap.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
            };
          });

          // sắp xếp đúng thứ tự thời gian
          setMessages(messageData.sort((a, b) => b.createdAt - a.createdAt));
        });
      };

      loadMessages();
      return () => unsubscribe && unsubscribe();
    }, [params?.id]),
  );

  const onSend = async (newMessages) => {
    const msg = newMessages[0];
    msg.createdAt = new Date(); // dùng Date chuẩn cho GiftedChat

    setMessages((prev) => GiftedChat.append(prev, newMessages));

    await addDoc(collection(db, 'Chat', params.id, 'Messages'), msg);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <GiftedChat
          messages={messages}
          onSend={(messages) => onSend(messages)}
          showUserAvatar
          alwaysShowSend
          bottomOffset={Platform.OS === 'android' ? 30 : 0}
          keyboardShouldPersistTaps="handled"
          textInputStyle={styles.input}
          user={{
            _id: user?.primaryEmailAddress?.emailAddress,
            name: user?.fullName,
            avatar: user?.imageUrl,
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    placeholderTextColor:Colors.GRAY,
  },
});
