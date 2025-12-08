import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useCallback, useLayoutEffect, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../Config/FirebaseConfig';
import Colors from '../../constants/Colors';

export default function ManageAdmin() {
  const [adminList, setAdminList] = useState([]);
  const router = useRouter();
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [showRoleList, setShowRoleList] = useState(false);
  const availableRoles = ["superadmin", "admin", "moderator"];

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Manage Admin',
    });
  }, [navigation]);
  //modal edit
  const openEditModal = (admin) => {
    const currentEmail = auth.currentUser?.email;
    if (admin.uid === currentEmail) {
      ToastAndroid.show("You cannot edit your own account.", ToastAndroid.SHORT);
      return;
    }
    if (admin.createdBy !== currentEmail) {
      ToastAndroid.show('You do not have permission to edit this admin', ToastAndroid.SHORT);
      return;
    }
    // Nếu đủ quyền thì mở modal
    setSelectedAdmin(admin);
    setShowModal(true);
  };
  const handleSaveRole = async () => {
    if (!selectedAdmin) return;

    try {
      await updateDoc(doc(db, "Admin", selectedAdmin.id), {
        role: newRole,
      });

      Alert.alert("Success", "Role updated successfully!");
      setShowModal(false);
      fetchAdmins(); // reload list
    } catch (err) {
      console.error("Update role error:", err);
    }
  };
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
        {item.createdBy ? (
          <Text style={styles.createdBy}>Created By: {item.createdBy}</Text>
        ) : null}
      </View>
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: 'red', marginBottom: 6 }]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors.PRIMARY }]}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
      </View>
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
      {showModal && (
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Role</Text>

            <Text style={{ marginBottom: 8 }}>Role:</Text>
            {/* BUTTON MỞ LIST ROLE */}
            <TouchableOpacity
              style={styles.selectBox}
              onPress={() => setShowRoleList(!showRoleList)}
            >
              <Text style={styles.selectText}>
                {newRole || "Select role"}
              </Text>
            </TouchableOpacity>

            {/* DANH SÁCH ROLE */}
            {showRoleList && (
              <View style={styles.dropdown}>
                {availableRoles.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setNewRole(r);
                      setShowRoleList(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Colors.PRIMARY }]}
                onPress={handleSaveRole}
              >
                <Text style={styles.modalBtnText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "gray" }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

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
  modalContainer: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
},
modalBox: {
  width: "80%",
  backgroundColor: "#fff",
  padding: 20,
  borderRadius: 12,
},
modalTitle: {
  fontFamily: "outfit-bold",
  fontSize: 18,
  marginBottom: 10,
},
input: {
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  padding: 10,
  marginBottom: 15,
},
modalActions: {
  flexDirection: "row",
  justifyContent: "space-between",
},
modalBtn: {
  flex: 1,
  padding: 10,
  borderRadius: 8,
  marginHorizontal: 5,
  alignItems: "center",
},
modalBtnText: {
  color: "#fff",
  fontFamily: "outfit-medium",
},
selectBox: {
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  padding: 10,
  marginBottom: 10,
},
selectText: {
  fontFamily: "outfit-medium",
  color: "#333",
},
dropdown: {
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  backgroundColor: "#fff",
  marginBottom: 15,
},
dropdownItem: {
  padding: 12,
  borderBottomWidth: 1,
  borderBottomColor: "#eee",
},
dropdownItemText: {
  fontFamily: "outfit",
},
actionContainer: {
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
},


});
