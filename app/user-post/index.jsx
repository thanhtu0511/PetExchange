import { useUser } from '@clerk/clerk-expo';
import { useNavigation, useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { db } from '../../Config/FirebaseConfig';
import PetListItem from '../../components/Home/PetListItem';
import Colors from '../../constants/Colors';

export default function UserPost() {
  const navigation = useNavigation();
  const { user } = useUser();
  const router = useRouter();

  const [userPostList, setUserPostList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 4; // 2x2 grid

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 60) / 2; // padding container + gap

  // Function lấy bài đăng user
  const GetUserPost = useCallback(async () => {
    if (!user) return;
    setLoader(true);
    setUserPostList([]);
    try {
      const q = query(
        collection(db, 'Pets'),
        where('email', '==', user?.primaryEmailAddress?.emailAddress),
      );
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUserPostList(posts);
      setPage(1);
    } catch (error) {
      console.log('GetUserPost error:', error);
    }
    setLoader(false);
  }, [user]);

  useEffect(() => {
    navigation.setOptions({ headerTitle: 'User Post' });
    GetUserPost();
  }, [navigation, GetUserPost]);

  const OnDeletePost = (docID) => {
    Alert.alert('Delete Post', 'Do you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => deletePost(docID) },
    ]);
  };

  const deletePost = async (docID) => {
    try {
      await deleteDoc(doc(db, 'Pets', docID));
      GetUserPost();
    } catch (error) {
      console.log('Delete error:', error);
    }
  };

  // Lấy data phân trang
  const dataToShow = userPostList.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(userPostList.length / pageSize);

  return (
    <View style={{ padding: 20, flex: 1 }}>
      <Text style={{ fontFamily: 'outfit-medium', fontSize: 30, marginBottom: 20 }}>User Post</Text>

      {loader && <Text>Loading...</Text>}

      <FlatList
        data={dataToShow}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 15 }}
        renderItem={({ item }) => (
          <View style={{ width: itemWidth }}>
            <PetListItem pet={item} width={itemWidth} />

            {/* Nút Update */}
            <Pressable
              onPress={() =>
                router.push({ pathname: '/update-pet', params: { petData: JSON.stringify(item) } })
              }
              style={styles.updateButton}
            >
              <Text style={{ fontFamily: 'outfit', textAlign: 'center', color: Colors.WHITE }}>
                Update
              </Text>
            </Pressable>

            {/* Nút Delete */}
            <Pressable onPress={() => OnDeletePost(item?.id)} style={styles.deleteButton}>
              <Text style={{ fontFamily: 'outfit', textAlign: 'center' }}>Delete</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<Text>No Post Found</Text>}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <Pressable
            disabled={page === 1}
            onPress={() => setPage((p) => p - 1)}
            style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
          >
            <Text style={styles.pageBtnText}>Prev</Text>
          </Pressable>

          <Text style={styles.pageNumber}>
            {page} / {totalPages}
          </Text>

          <Pressable
            disabled={page === totalPages}
            onPress={() => setPage((p) => p + 1)}
            style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
          >
            <Text style={styles.pageBtnText}>Next</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    backgroundColor: Colors.LIGHT_PRIMARY,
    padding: 5,
    borderRadius: 7,
    marginTop: 5,
  },
  updateButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 5,
    borderRadius: 7,
    marginTop: 5,
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
