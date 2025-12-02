import { useRouter } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import Colors from "../../constants/Colors";

export default function ExchangeCategoryItem({ category }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: category.navigate,
          params: {
            pets: JSON.stringify(category.pets),
            title: category.title,
          },
        })
      }
      style={{
        backgroundColor: Colors.WHITE,
        padding: 20,
        borderRadius: 15,
        marginBottom: 18,
      }}
    >
      <Text style={{ fontFamily: "outfit-medium", fontSize: 18 }}>
        {category.title}
      </Text>
      <Text style={{ fontFamily: "outfit", color: Colors.GRAY, marginTop: 6 }}>
        {category.description}
      </Text>
      <Text
        style={{
          fontFamily: "outfit-medium",
          fontSize: 15,
          marginTop: 10,
          color: Colors.PRIMARY,
        }}
      >
        {category.count} items
      </Text>
    </TouchableOpacity>
  );
}
