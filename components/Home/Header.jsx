import { useUser } from '@clerk/clerk-expo';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../Config/FirebaseConfig';
import Colors from '../../constants/Colors';

export default function Header() {
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  const userEmail = user?.emailAddresses?.[0]?.emailAddress;

  const fetchUnreadNotifications = async () => {
    if (!userEmail) return;
    try {
      const q = query(
        collection(db, 'Notifications'),
        where('to', '==', userEmail),
        where('status', '==', 'unread')
      );
      const snapshot = await getDocs(q);
      setUnreadCount(snapshot.size);
    } catch (error) {
      console.log('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();
  }, [userEmail]);

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.welcomeText}>Welcome,</Text>
        <Text style={styles.nameText}>{user?.fullName}</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => router.push('/notifications')}
          style={{ marginRight: 16 }}
        >
          <AntDesign name="bells" size={28} color={Colors.PRIMARY} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <Image
          source={{ uri: user?.imageUrl }}
          style={{ width: 40, height: 40, borderRadius: 99 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  welcomeText: {
    fontFamily: 'outfit',
    fontSize: 18,
  },
  nameText: {
    fontFamily: 'outfit-medium',
    fontSize: 25,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'red',
    borderRadius: 99,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
