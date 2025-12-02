// app/(tabs)/search.jsx
import { Keyboard, SafeAreaView, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import PetListSearchByCategory from '../../components/Search/PetListSearchByCategory';
export default function SearchScreen() {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
        <PetListSearchByCategory />
      </SafeAreaView>
    </TouchableWithoutFeedback>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
});
