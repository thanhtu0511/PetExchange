import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../Config/FirebaseConfig';
import Colors from '../../constants/Colors';
export default function ManageSliders() {
  const [sliderList, setSliderList] = useState([]);
  const router = useRouter();
  const flatListRef = useRef(null);
  const screenWidth = Dimensions.get('screen').width;
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Manage Sliders',
    });
  }, [navigation]);
  useEffect(
    () => {
      fetchSliders();
    },
    /* TODO: add missing dependencies */ [],
  );
  useFocusEffect(
    useCallback(
      () => {
        fetchSliders;
      },
      /* TODO: add missing dependencies */ [],
    ),
  );
  const fetchSliders = async () => {
    const snapshot = await getDocs(collection(db, 'Sliders'));
    const list = [];
    snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
    setSliderList(list);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Slider', 'Are you sure you want to delete this slider?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'Sliders', id));
          fetchSliders(); // refresh list
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.title}>Manage Sliders</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/admin/add-new-slider')}
        >
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={sliderList}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginRight: 15 }}>
            <Image
              source={{ uri: item.imageUrl }}
              style={[styles.sliderImage, { width: screenWidth * 0.8 }]}
            />
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: 'outfit-bold', fontSize: 22 },
  addBtn: { padding: 10, backgroundColor: Colors.PRIMARY, borderRadius: 10 },
  addBtnText: { color: '#fff', fontFamily: 'outfit-medium' },
  sliderImage: { height: 180, borderRadius: 15 },
  deleteBtn: {
    marginTop: 5,
    padding: 8,
    backgroundColor: 'red',
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteText: { color: '#fff', fontFamily: 'outfit-medium' },
});
