import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { deleteDoc, doc } from 'firebase/firestore';
import { useLayoutEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AboutPet from '../../components/PetDetails/AboutPet';
import OwnerInfo from '../../components/PetDetails/OwnerInfo';
import PetInfo from '../../components/PetDetails/PetInfo';
import PetSubInfo from '../../components/PetDetails/PetSubInfo';
import { db } from '../../Config/FirebaseConfig';

export default function PetDetailsAdmin() {
  const pet = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Lấy thông tin safe area

  // Set header options
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: '',
    });
  }, [navigation]);

  const handleDelete = () => {
    Alert.alert('Delete Pet', 'Are you sure you want to delete this pet?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'Pets', pet.id));
            Alert.alert('Success', 'Pet deleted successfully');
            router.back();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete pet');
            console.error('Delete pet error:', error);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
        <PetInfo pet={pet} />
        <PetSubInfo pet={pet} />
        <AboutPet pet={pet} />
        <OwnerInfo pet={pet} />
      </ScrollView>

      {/* DELETE BUTTON */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>Delete Pet</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bottomContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    backgroundColor: '#fff',
  },
  deleteBtn: {
    padding: 15,
    backgroundColor: 'red',
  },
  deleteText: {
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'outfit-medium',
    color: 'white',
  },
});
