import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { useCallback, useLayoutEffect, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../Config/FirebaseConfig';
import Colors from '../../constants/Colors';
export default function ManageAdmin() {
  const [adminList, setAdminList] = useState([]);
  const router = useRouter();
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Manage Admin',
    });
  }, [navigation]);

  // Fetch all admins

  const fetchAdmins = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'Admin'));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAdminList(list);
    } catch (err) {
      console.error('Fetch admins error:', err);
    }
  };

  useFocusEffect(
    useCallback(
      () => {
        fetchAdmins();
      },
      /* TODO: add missing dependencies */ [],
    ),
  );

  const handleDelete = (id) => {
    const currentUid = auth.currentUser.uid;
    const currentAdmin = adminList.find((a) => a.uid === currentUid);
    const targetAdmin = adminList.find((a) => a.id === id);

    if (!targetAdmin) return;

    // Không xóa chính mình
    if (currentUid === targetAdmin.uid) {
      Alert.alert('Warning', 'You cannot delete the account you are currently logged in with.');
      return;
    }

    // Không xóa admin cùng role
    if (currentAdmin && currentAdmin.role === targetAdmin.role) {
      Alert.alert('Warning', 'You cannot delete an admin with the same role as you.');
      return;
    }

    Alert.alert('Delete Admin', 'Are you sure you want to delete this admin?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'Admin', id));
            fetchAdmins();
          } catch (err) {
            console.error('Delete admin error:', err);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.adminItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.avatar} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.role}>{item.role?.name || item.role}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: 'red' }]}
        onPress={() => handleDelete(item.id)}
      >
        <Text style={styles.buttonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 15,
        }}
      >
        <Text style={styles.title}>Manage Admin</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/admin/add-new-admin')}>
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={adminList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: 'outfit-bold', fontSize: 22 },
  addBtn: { padding: 10, backgroundColor: Colors.PRIMARY, borderRadius: 10 },
  addBtnText: { color: '#fff', fontFamily: 'outfit-medium' },
  adminItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 10,
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  username: { fontFamily: 'outfit-medium', fontSize: 16 },
  email: { fontFamily: 'outfit-regular', color: '#555' },
  role: { fontFamily: 'outfit-medium', color: Colors.PRIMARY, marginTop: 2 },
  button: {
    width: 70,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontFamily: 'outfit-medium' },
});
