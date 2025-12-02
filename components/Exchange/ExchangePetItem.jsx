import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../constants/Colors";

export default function ExchangePetItem({ pet, navigateToRequests = false }) {
  const router = useRouter();

  const handlePress = () => {
    if (navigateToRequests) {
      router.push({
        pathname: "/user-exchange/pet-requests-details",
        params: pet,
      });
    } else {
      router.push({
        pathname: "/pet-details",
        params: pet,
      });
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        flexDirection: "row",
        padding: 12,
        backgroundColor: Colors.WHITE,
        borderRadius: 15,
        marginBottom: 16,
      }}
    >
      <Image
        source={{ uri: pet.imageUrl }}
        style={{ width: 85, height: 85, borderRadius: 12 }}
      />
      <View style={{ flex: 1, marginLeft: 12, justifyContent: "center" }}>
        <Text style={{ fontFamily: "outfit-medium", fontSize: 17 }}>
          {pet.name}
        </Text>
        <Text
          style={{
            fontFamily: "outfit",
            color: Colors.GRAY,
            marginTop: 2,
          }}
        >
          Status: {pet.exchangeStatus || "available"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
