import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../../Config/FirebaseConfig';
import Colors from '../../constants/Colors';
import Category from '../Home/Category';
import PetListSearchItem from './PetListSearchItem';
import SearchFilterBar from './SearchFilterBar';

export default function PetListSearchByCategory() {
  const [petList, setPetList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortPrice, setSortPrice] = useState('asc');
  const pageSize = 5;

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

  const filteredPets = petList
    .filter((pet) => {
      const matchesSearch = pet.name.toLowerCase().includes(searchText.toLowerCase()) 
                        || pet.breed.toLowerCase().includes(searchText.toLowerCase());
      const price = pet.price || 0;
      const min = minPrice ? Number(minPrice) : 0;
      const max = maxPrice ? Number(maxPrice) : Infinity;
      const matchesPrice = price >= min && price <= max;
      return matchesSearch && matchesPrice;
    })
    .sort((a, b) => (sortPrice === 'asc' ? a.price - b.price : b.price - a.price));

  const dataToShow = filteredPets.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredPets.length / pageSize);

  return (
    <View style={{ flex: 1,padding: 20,marginTop: 10 }}>
      <Category category={(value) => GetPetList(value)} />

      <SearchFilterBar
        onSearchChange={setSearchText}
        onPriceChange={(min, max) => { setMinPrice(min); setMaxPrice(max); }}
        onSortChange={setSortPrice}
        defaultSort="asc"
      />

      {loader ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} style={{ marginVertical: 20 }} />
      ) : (
        <FlatList
          data={dataToShow}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <PetListSearchItem pet={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}

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
