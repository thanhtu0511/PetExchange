import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { useCallback, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PetListItem from '../../components/Admin/PetListItem';
import Category from '../../components/Home/Category';
import { db } from '../../Config/FirebaseConfig';
import Colors from '../../constants/Colors';
export default function ManagePets() {
  const [petList, setPetList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all"); 
  const pageSize = 4;
  const navigation = useNavigation();
    useLayoutEffect(() => {
      navigation.setOptions({
        title: 'Manage Admin',
      });
    }, [navigation]);
  useFocusEffect(
    useCallback(() => {
      fetchPets("Dogs");
    }, [])
  );

  const fetchPets = async (category) => {
  try {
    setLoading(true);

    // Truy vấn các pet theo category
    const q = query(collection(db, "Pets"), where("category", "==", category));
    const snap = await getDocs(q);

    // Chuyển snapshot thành mảng
    let pets = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Lọc theo trạng thái exchangeStatus
    pets = pets.filter((pet) => {
      switch (filterStatus) {
        case "pending":
          return pet.exchangeStatus === "pendingApproval";
        default:
          return true;
      }
    });

    setPetList(pets);
    } catch (error) {
      console.error("Error fetching pets:", error);
      ToastAndroid.show("Lỗi khi tải danh sách thú cưng!", ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };


  const approvePet = async (pet) => {
    await updateDoc(doc(db, "Pets", pet.id), {
      exchangeStatus: "available",
      createdAt: new Date().toISOString(),
    });

    await addNotification(pet, "approved");

    Alert.alert("Success", "Pet approved!");
    fetchPets(pet.category);
  };


  const rejectPet = async (pet) => {
    Alert.alert(
      "Reject Post",
      "Are you sure you want to reject and delete this pet post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            await addNotification(pet, "rejected");
            await deleteDoc(doc(db, "Pets", pet.id));
            Alert.alert("Rejected", "Pet has been removed.");
            fetchPets(pet.category); 
          },
        },
      ]
    );
  };


  const addNotification = async (pet, type) => {
    const ref = collection(db, "Notifications");
    await addDoc(ref, {
      to: pet.email,
      petName: pet.name,
      type, // "approved" hoặc "rejected"
      message:
        type === "approved"
          ? `Your pet "${pet.name}" has been approved!`
          : `Your post "${pet.name}" was rejected by admin.`,
      createdAt: new Date().toISOString(),
      status: "unread",
    });
  };


  const dataToShow = petList.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(petList.length / pageSize);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <Category category={(value) => fetchPets(value)} />

        {/* Filter button */}
        <View style={styles.filterContainer}>
          {[
            { key: "pending", label: "Pending Approval" },
            { key: "all", label: "All Posts" },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => {
                setFilterStatus(item.key);
                fetchPets("Dogs");
              }}
              style={[
                styles.filterBtn,
                filterStatus === item.key && styles.filterBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filterStatus === item.key && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>



        <Text style={styles.title}>Manage Pets</Text>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={Colors.PRIMARY} />
          </View>
        ) : (
          <>
            <FlatList
              data={dataToShow}
              numColumns={2}
              keyExtractor={(item) => item.id}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              renderItem={({ item }) => (
                <View>
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "../admin/pet-details",
                        params: item,
                      })
                    }
                  >
                    <PetListItem pet={item} />
                  </TouchableOpacity>

                  {/* Buttons Approve / Reject */}
                  {(!item.exchangeStatus ||
                    item.exchangeStatus === "pendingApproval") && (
                    <View style={styles.actionContainer}>
                      <TouchableOpacity
                        style={styles.circleBtnApprove}
                        onPress={() => approvePet(item)}
                      >
                        <Text style={styles.circleBtnText}>✔</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.circleBtnReject}
                        onPress={() => rejectPet(item)}
                      >
                        <Text style={styles.circleBtnText}>✖</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
              contentContainerStyle={{ paddingBottom: 20 }}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  disabled={page === 1}
                  onPress={() => setPage((p) => p - 1)}
                  style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                >
                  <Text style={styles.pageBtnText}>Prev</Text>
                </TouchableOpacity>

                <Text style={styles.pageNumber}>
                  {page} / {totalPages}
                </Text>

                <TouchableOpacity
                  disabled={page === totalPages}
                  onPress={() => setPage((p) => p + 1)}
                  style={[
                    styles.pageBtn,
                    page === totalPages && styles.pageBtnDisabled,
                  ]}
                >
                  <Text style={styles.pageBtnText}>Next</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: "outfit-bold",
    fontSize: 22,
    color: Colors.SECONDARY,
    marginTop: 15,
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#ddd",
    borderRadius: 10,
  },
  filterBtnActive: {
    backgroundColor: Colors.PRIMARY,
  },
  filterText: {
    fontFamily: "outfit",
  },
  filterTextActive: {
    color: "#fff",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  circleBtnApprove: {
    width: 36,
    height: 36,
    borderRadius: 50,
    backgroundColor: "#4CAF50", // xanh lá
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  circleBtnReject: {
    width: 36,
    height: 36,
    borderRadius: 50,
    backgroundColor: "#E53935", // đỏ
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },

  circleBtnText: {
    color: "white",
    textAlign: "center",
    fontFamily: "outfit-medium",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 20,
  },
  pageBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 10,
  },
  pageBtnDisabled: {
    backgroundColor: "#ccc",
  },
  pageBtnText: {
    color: "white",
  },
  pageNumber: {
    fontSize: 16,
    fontFamily: "outfit-medium",
  },
});
