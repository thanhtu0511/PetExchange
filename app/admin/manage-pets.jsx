import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Category from '../../components/Home/Category';
import { db } from '../../Config/FirebaseConfig';
import Colors from '../../constants/Colors';
import PetListItem from './components/PetListItem';
export default function ManagePets() {
  const [petList, setPetList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 4; // 2x2 grid
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Manage Pets',
    });
  }, [navigation]);
  useEffect(
    () => {
      fetchPetsByCategory('Dogs');
    },
    /* TODO: add missing dependencies */ [],
  );
  useFocusEffect(
    useCallback(
      () => {
        fetchPetsByCategory('Dogs');
      },
      /* TODO: add missing dependencies */ [],
    ),
  );
  const fetchPetsByCategory = async (category) => {
    setLoading(true);
    const q = query(collection(db, 'Pets'), where('category', '==', category));
    const snapshot = await getDocs(q);

    const list = [];
    snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));

    setPetList(list);
    setPage(1);
    setLoading(false);
  };

  const dataToShow = petList.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(petList.length / pageSize);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        {/* Category filter */}
        <Category category={(value) => fetchPetsByCategory(value)} style={{ flexShrink: 0 }} />

        <Text style={styles.title}>📌 Manage Pets</Text>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.PRIMARY} />
          </View>
        ) : (
          <>
            <FlatList
              data={dataToShow}
              numColumns={2}
              keyExtractor={(item) => item.id}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => router.push({ pathname: '../admin/pet-details', params: item })}
                >
                  <PetListItem pet={item} />
                </TouchableOpacity>
              )}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 20 }}
            />

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
                  style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
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
    fontFamily: 'outfit-bold',
    fontSize: 22,
    color: Colors.SECONDARY,
    marginTop: 15,
    marginBottom: 12,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#cccccc',
  },
  pageBtnText: {
    color: 'white',
    fontFamily: 'outfit-medium',
  },
  pageNumber: {
    fontSize: 16,
    fontFamily: 'outfit-medium',
  },
});
