import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useLayoutEffect, useState } from 'react';
import { Image, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../Config/FirebaseConfig';
import Colors from '../../constants/Colors';
export default function Dashboard() {
  const auth = getAuth();
  const [adminData, setAdminData] = useState(null);
  const navigation = useNavigation();
  // Nếu dùng navigation.setOptions:
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!auth.currentUser) return;
      const uid = auth.currentUser.uid;

      const adminDoc = await getDoc(doc(db, 'Admin', uid));
      if (adminDoc.exists()) {
        setAdminData(adminDoc.data());
      }
    };

    fetchAdminData();
  }, [auth.currentUser]);

  return (
    <View style={{ flex: 1, padding: 20, marginTop: 50 }}>
      <Text
        style={{ fontSize: 30, fontFamily: 'outfit-bold', marginBottom: 20, textAlign: 'center' }}
      >
        Admin Dashboard
      </Text>

      {adminData && (
        <View style={{ marginBottom: 20, alignItems: 'center' }}>
          <Image
            source={{ uri: adminData.imageUrl }}
            style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10 }}
          />
          <Text style={{ fontFamily: 'outfit', fontSize: 18 }}>{adminData.username}</Text>
          <Text style={{ fontFamily: 'outfit', fontSize: 16, color: Colors.GRAY }}>
            {adminData.email}
          </Text>
        </View>
      )}

      <Pressable style={styles.button} onPress={() => router.push('/admin/manage-pets')}>
        <Text style={styles.buttonText}>Manage Pets</Text>
      </Pressable>

      {/* Chỉ superadmin mới được vào Manage Admin */}
      {adminData && adminData.role === 'superadmin' && (
        <Pressable style={styles.button} onPress={() => router.push('/admin/manage-admin')}>
          <Text style={styles.buttonText}>Manage Admin</Text>
        </Pressable>
      )}

      <Pressable style={styles.button} onPress={() => router.push('/admin/manage-sliders')}>
        <Text style={styles.buttonText}>Manage Slider</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => router.push('/admin/profile')}>
        <Text style={styles.buttonText}>Profile</Text>
      </Pressable>

      {/* Nút Logout */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: 'red' }]}
        onPress={() => router.replace('/login')}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  button: {
    padding: 15,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonText: {
    fontFamily: 'outfit-medium',
    textAlign: 'center',
    fontSize: 18,
    color: '#fff',
  },
};
