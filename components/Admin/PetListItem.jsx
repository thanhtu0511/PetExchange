import { useRouter } from 'expo-router';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';

const screenWidth = Dimensions.get('window').width;
const itemWidth = (screenWidth - 50) / 2;

export default function PetListItem({ pet }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/admin/pet-details',
          params: pet,
        })
      }
      style={{
        width: itemWidth,
        backgroundColor: Colors.WHITE,
        borderRadius: 15,
        padding: 10,
        marginBottom: 10,
        overflow: 'hidden',
      }}
    >
      <Image
        source={{ uri: pet?.imageUrl }}
        style={{
          width: '100%',
          height: 130,
          borderRadius: 10,
        }}
      />

      <Text
        style={{
          fontFamily: 'outfit-medium',
          fontSize: 18,
        }}
      >
        {pet.name}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: Colors.GRAY,
            fontFamily: 'outfit',
          }}
        >
          {pet.breed}
        </Text>

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
