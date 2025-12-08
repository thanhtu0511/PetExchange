import { useUser } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useLayoutEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../Config/FirebaseConfig'; // path đến config Firestore

export default function NotificationsScreen({ onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const { user } = useUser();
  const navigation = useNavigation();

  const userEmail = user?.emailAddresses?.[0]?.emailAddress;

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Notifications' });
  }, [navigation]);

  useEffect(() => {
    if (!userEmail) return;

    // Query notifications của user
    const q = query(
      collection(db, "Notifications"),
      where("to", "==", userEmail)
    );

    // Lắng nghe realtime
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(data);

      // Tính số thông báo chưa đọc để gửi lên header badge
      const unreadCount = data.filter(n => n.status === 'unread').length;
      if (onUnreadCountChange) {
        onUnreadCountChange(unreadCount);
      }
    });

    return () => unsubscribe();
  }, [userEmail]);

  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, "Notifications", id), { status: "read" });
      // Không cần fetch lại, onSnapshot sẽ tự cập nhật
    } catch (error) {
      console.log("Error marking notification as read:", error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => markAsRead(item.id)}
            style={[
              styles.notificationItem,
              item.status === 'unread' && { backgroundColor: '#eef' },
            ]}
          >
            <Text style={{ fontWeight: item.status === 'unread' ? 'bold' : 'normal' }}>
              {item.message || 'No message'}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No notifications</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  notificationItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderRadius: 8,
    marginBottom: 8,
  },
});
