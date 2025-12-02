import { useAuth, useUser } from '@clerk/clerk-expo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../constants/Colors';
export default function Profile() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();
  const Menu = [
    {
      id: 1,
      name: 'Add New Pet',
      icon: 'add-circle',
      path: '/add-new-pet',
    },
    {
      id: 5,
      name: 'My Post',
      icon: 'bookmark',
      path: '/user-post',
    },
    {
      id: 2,
      name: 'Favorites',
      icon: 'heart',
      path: '/(tabs)/favorite',
    },
    {
      id: 3,
      name: 'Inbox',
      icon: 'chatbubble',
      path: '/(tabs)/inbox',
    },
    {
      id: 6,
      name: 'Exchange Requests',  // <-- mới
      icon: 'swap-horizontal',
      path: '/user-exchange',     // <-- màn hình mới
    },
    {
      id: 4,
      name: 'Logout',
      icon: 'exit',
      path: 'logout',
    },
  ];
  const onPressMenu = (menu) => {
    if (menu.path == 'logout') {
      signOut();
      router.replace('/login');
      return;
    }
    router.push(menu.path);
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
      style={{
        padding: 20,
        marginTop: 20,
      }}
    >
      <Text
        style={{
          fontFamily: 'outfit-medium',
          fontSize: 30,
        }}
      >
        Profile
      </Text>
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          marginVertical: 25,
        }}
      >
        <Image
          source={{ uri: user?.imageUrl }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 99,
          }}
        />
        <Text
          style={{
            fontFamily: 'outfit',
            fontSize: 20,
            marginTop: 6,
          }}
        >
          {user?.fullName}
        </Text>
        <Text
          style={{
            fontFamily: 'outfit',
            fontSize: 16,
            color: Colors.GRAY,
          }}
        >
          {user?.primaryEmailAddress?.emailAddress}
        </Text>
      </View>

      <FlatList
        data={Menu}
        contentContainerStyle={{
          paddingBottom: 160, // tránh tab bar
        }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => onPressMenu(item)}
            style={{
              marginVertical: 10,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              padding: 10,
              backgroundColor: Colors.WHITE,
              borderRadius: 10,
            }}
          >
            <Ionicons
              name={item?.icon}
              size={30}
              color={Colors.PRIMARY}
              style={{
                padding: 10,
                backgroundColor: Colors.LIGHT_PRIMARY,
                borderRadius: 10,
              }}
            />
            <Text
              style={{
                fontFamily: 'outfit',
                fontSize: 20,
              }}
            >
              {item?.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
    </SafeAreaView>
  );
}
