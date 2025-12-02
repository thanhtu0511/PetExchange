import { useRouter } from 'expo-router';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';
import MarkFav from './../../components/MarkFav';

const screenWidth = Dimensions.get('window').width;
const cardHeight = 100; // chiều cao card

export default function PetListSearchItem({ pet }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/pet-details',
          params: pet,
        })
      }
      style={styles.card}
    >
      {/* Pet Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: pet?.imageUrl }}
          style={styles.image}
        />
        <View style={styles.favIcon}>
          <MarkFav pet={pet} color="white" />
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
          {pet.name}
        </Text>

        <Text style={styles.breed} numberOfLines={1} ellipsizeMode="tail">
          {pet.breed}
        </Text>

        <View style={styles.bottomRow}>
          <Text style={styles.age}>{pet.age} YRS</Text>
          <Text style={styles.price}>{pet?.price && Number(pet?.price) !== 0 ? `${Number(pet?.price).toLocaleString()} đ` : 'Free'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    width: '100%',
    height: cardHeight,
    backgroundColor: Colors.WHITE,
    borderRadius: 15,
    padding: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  imageContainer: {
    width: cardHeight, // hình vuông
    height: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  favIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 10,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontFamily: 'outfit-medium',
    fontSize: 16,
  },
  breed: {
    fontFamily: 'outfit',
    fontSize: 14,
    color: Colors.GRAY,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  age: {
    fontFamily: 'outfit',
    fontSize: 12,
    color: Colors.PRIMARY,
    backgroundColor: Colors.LIGHT_PRIMARY,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  price: {
    fontFamily: 'outfit-medium',
    fontSize: 14,
    color: Colors.SECONDARY,
  },
});
