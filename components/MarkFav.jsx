import { useUser } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Shared from './../Shared/Shared';

export default function MarkFav({ pet }) {
  const { user } = useUser();
  const [favList, setFavList] = useState([]);

  useEffect(() => {
    if (user) fetchFav();
  }, [user]);

  // Lấy danh sách favorite từ Firestore
  const fetchFav = async () => {
    const result = await Shared.GetFavList(user);
    setFavList(result?.favorites || []);
  };

  // Thêm vào favorites
  const addToFav = async () => {
    if (!favList.includes(pet.id)) {
      await Shared.AddToFav(user, pet.id);
      fetchFav(); // refresh UI
    }
  };

  // Xóa khỏi favorites
  const removeFromFav = async () => {
    await Shared.RemoveFromFav(user, pet.id);
    fetchFav(); // refresh UI
  };

  return (
    <View>
      {favList?.includes(pet.id) ? (
        <Pressable onPress={removeFromFav}>
          <Ionicons name="heart" size={30} color="red" />
        </Pressable>
      ) : (
        <Pressable onPress={addToFav}>
          <Ionicons name="heart-outline" size={30} color="black" />
        </Pressable>
      )}
    </View>
  );
}
