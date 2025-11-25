import { router } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function UserItem({ userInfo }) {
  const isAI = userInfo.isAI;

  const handlePress = () => {
    if (isAI) {
      router.push('/ai-chat');
    } else {
      router.push('/chat?id=' + userInfo.docID);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        paddingVertical: 14,
        paddingHorizontal: 10,
      }}
    >
      <Image
        source={isAI ? userInfo.avatar : { uri: userInfo?.imageUrl }}
        style={{
          width: 60,
          height: 60,
          borderRadius: 99,
          borderWidth: isAI ? 2.5 : 1,
          borderColor: isAI ? '#9b5de5' : '#dcdcdc',
        }}
      />

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: 'outfit-medium',
            fontSize: 22,
            color: isAI ? '#7a1eb0' : '#222',
          }}
          numberOfLines={1}
        >
          {userInfo?.name}
        </Text>

        {isAI && (
          <Text
            style={{
              fontFamily: 'outfit',
              fontSize: 15,
              marginTop: 3,
              color: '#7a1eb0',
            }}
            numberOfLines={1}
          >
            🤖 Chatbot hỗ trợ về thú cưng
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
