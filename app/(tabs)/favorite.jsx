import { useUser } from '@clerk/clerk-expo';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../Config/FirebaseConfig';
import Shared from '../../Shared/Shared';
import Colors from '../../constants/Colors';
import PetListItem from './../../components/Home/PetListItem';

export default function Favorite() {
  const { user } = useUser();
  const [favPetList, setFavPetList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 4; // 2x2 grid

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    setLoader(true);
    const result = await Shared.GetFavList(user);
    const favIds = result?.favorites || [];

    if (favIds.length > 0) {
      const q = query(collection(db, 'Pets'), where('id', 'in', favIds));
      const querySnapshot = await getDocs(q);

      const pets = [];
      querySnapshot.forEach((doc) => pets.push(doc.data()));

      setFavPetList(pets);
    } else {
      setFavPetList([]);
    }

    setPage(1); // reset page khi load lại
    setLoader(false);
  };

  const totalPages = Math.ceil(favPetList.length / pageSize);
  const dataToShow = favPetList.slice((page - 1) * pageSize, page * pageSize);

  return (
    <View style={{ padding: 20, marginTop: 20, flex: 1 }}>
      <Text style={styles.title}>Favorites</Text>

      <View style={{ minHeight: 360 }}>
        <FlatList
          data={dataToShow}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 15 }}
          renderItem={({ item }) => <PetListItem pet={item} />}
          onRefresh={fetchFavorites}
          refreshing={loader}
        />
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'outfit-medium',
    fontSize: 30,
    marginBottom: 20,
    color: Colors.SECONDARY,
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
