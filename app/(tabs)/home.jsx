import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link } from 'expo-router';
import { FlatList, SafeAreaView, StyleSheet, Text } from 'react-native';
import Header from '../../components/Home/Header';
import PetListByCategory from '../../components/Home/PetListByCategory';
import Slider from '../../components/Home/Slider';
import Colors from '../../constants/Colors';

export default function Home() {
  const data = [{ key: 'header' }, { key: 'slider' }, { key: 'category' }, { key: 'addPet' }];

  const renderItem = ({ item }) => {
    switch (item.key) {
      case 'header':
        return <Header />;
      case 'slider':
        return <Slider />;
      case 'category':
        return <PetListByCategory />;
      case 'addPet':
        return (
          <Link href={'add-new-pet'} style={styles.adddNewPetContainer}>
            <MaterialIcons name="pets" size={24} color={Colors.PRIMARY} />
            <Text
              style={{
                fontFamily: 'outfit-medium',
                color: Colors.PRIMARY,
                fontSize: 18,
              }}
            >
              Add New Pet
            </Text>
          </Link>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  adddNewPetContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: Colors.LIGHT_PRIMARY,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    borderRadius: 15,
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
});
