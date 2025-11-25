import { useRouter } from 'expo-router';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';
import MarkFav from './../../components/MarkFav';

const screenWidth = Dimensions.get('window').width;
const itemWidth = (screenWidth - 50) / 2; // trừ padding container + khoảng giữa 2 cột

export default function PetListItem({ pet }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/pet-details',
          params: pet,
        })
      }
      style={{
        width: itemWidth,
        backgroundColor: Colors.WHITE,
        borderRadius: 15,
        padding: 10,
        marginBottom: 15, // khoảng cách giữa các hàng
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Favorite Icon */}
      <View
        style={{
          position: 'absolute',
          zIndex: 10,
          right: 10,
          top: 10,
        }}
      >
        <MarkFav pet={pet} color="white" />
      </View>

      {/* Pet Image */}
      <Image
        source={{ uri: pet?.imageUrl }}
        style={{
          width: '100%',
          height: 130,
          borderRadius: 10,
        }}
      />

      {/* Pet Name */}
      <Text
        style={{
          fontFamily: 'outfit-medium',
          fontSize: 18,
          marginTop: 8,
        }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {pet.name}
      </Text>

      {/* Breed + Age */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 5,
        }}
      >
        {/* Breed */}
        <Text
          style={{
            color: Colors.GRAY,
            fontFamily: 'outfit',
            flex: 1,
            marginRight: 5,
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {pet.breed}
        </Text>

        {/* Age */}
        <Text
          style={{
            color: Colors.PRIMARY,
            fontFamily: 'outfit',
            paddingHorizontal: 7,
            borderRadius: 10,
            fontSize: 11,
            backgroundColor: Colors.LIGHT_PRIMARY,
          }}
        >
          {pet.age} YRS
        </Text>
      </View>
    </TouchableOpacity>
  );
}
