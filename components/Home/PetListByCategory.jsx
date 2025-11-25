import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../Config/FirebaseConfig';
import Colors from '../../constants/Colors';
import Category from './Category';
import PetListItem from './PetListItem';

export default function PetListByCategory() {
  const [petList, setPetList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 4; // 2x2 grid

  useEffect(() => {
    GetPetList('Dogs');
  }, []);

  const GetPetList = async (category) => {
    setLoader(true);
    const q = query(collection(db, 'Pets'), where('category', '==', category));
    const querySnapshot = await getDocs(q);
    const pets = [];
    querySnapshot.forEach((doc) => pets.push(doc.data()));
    setPetList(pets);
    setPage(1);
    setLoader(false);
  };

  const dataToShow = petList.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(petList.length / pageSize);

  return (
    <View style={{ marginTop: 10 }}>
      <Category category={(value) => GetPetList(value)} />

      <Text style={styles.title}>Recommended Pets</Text>

      <View style={{ minHeight: 360 }}>
        <FlatList
          data={dataToShow}
          numColumns={2}
          keyExtractor={(item, index) => index}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => <PetListItem pet={item} />}
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
    fontSize: 18,
    color: Colors.SECONDARY,
    marginTop: 12,
    marginBottom: 10,
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
