import { useUser } from '@clerk/clerk-expo';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { addDoc, collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Keyboard, Platform, StyleSheet, View } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../Config/FirebaseConfig';
import Colors from '../../constants/Colors';

export default function AIChatScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({ headerTitle: 'AI Assistant' });

      let unsubscribe;
      if (!user) return;

      const q = query(collection(db, 'aiChats', user.id, 'messages'), orderBy('createdAt', 'desc'));

      unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedMessages = snapshot.docs.map((doc) => ({
          _id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate
            ? doc.data().createdAt.toDate()
            : new Date(doc.data().createdAt),
        }));
        setMessages(loadedMessages);
      });

      return () => unsubscribe && unsubscribe();
    }, [user]),
  );

  const onSend = useCallback(
    async (newMessages = []) => {
      Keyboard.dismiss();
      if (!user) return;

      const userMessage = {
        ...newMessages[0],
        createdAt: Timestamp.fromDate(new Date()),
        user: {
          _id: 1,
          name: user.fullName,
          avatar: user.imageUrl,
        },
      };

      setIsSending(true);
      try {
        // Lưu user message lên Firestore
        await addDoc(collection(db, 'aiChats', user.id, 'messages'), userMessage);

        // Gọi server AI
        const res = await fetch('https://ai-server-utim.onrender.com/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: newMessages[0].text }),
        });
        const data = await res.json();

        const botMessage = {
          _id: Math.random().toString(),
          text: data.text || 'Mình không hiểu, bạn thử nói lại nhé.',
          createdAt: Timestamp.fromDate(new Date()),
          user: {
            _id: 2,
            name: 'AI',
            avatar: 'https://demoda.vn/wp-content/uploads/2022/01/anh-meo-de-thuong-1.jpg',
          },
        };

        // Lưu bot message lên Firestore
        await addDoc(collection(db, 'aiChats', user.id, 'messages'), botMessage);
      } catch (error) {
        console.error('Server error:', error);
      } finally {
        setIsSending(false);
      }
    },
    [user],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <GiftedChat
          messages={messages}
          onSend={(msgs) => onSend(msgs)}
          user={{
            _id: 1,
            name: user?.fullName,
            avatar: user?.imageUrl,
          }}
          placeholder="Nhập tin nhắn..."
          showUserAvatar
          alwaysShowSend
          renderLoading={() => <ActivityIndicator size="large" />}
          bottomOffset={Platform.OS === 'android' ? 30 : 0}
          textInputStyle={styles.input}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  input: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 10 ,placeholderTextColor: Colors.GRAY},
});
