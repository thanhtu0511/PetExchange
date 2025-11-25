import { useUser } from '@clerk/clerk-expo';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { db } from '../../Config/FirebaseConfig';
import UserItem from '../../components/Inbox/UserItem';

export default function Inbox() {
  const { user } = useUser();
  const [userList, setUserList] = useState([]);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    GetUserList();
  }, [user]);
  //Get user list depends on current email
  const GetUserList = async () => {
    setLoader(true);
    setUserList([]);
    const q = query(
      collection(db, 'Chat'),
      where('userIDs', 'array-contains', user?.primaryEmailAddress?.emailAddress),
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      setUserList((prevList) => [...prevList, doc.data()]);
    });
    setLoader(false);
  };

  //filter the list of other user in one state
  const MapOtherUserList = () => {
    const list = [];
    userList.forEach((record) => {
      const currentEmail = user?.primaryEmailAddress?.emailAddress;
      const otherUser = record.users?.filter((u) => u?.email !== currentEmail);
      const result = {
        docID: record.id,
        ...otherUser?.[0],
      };
      list.push(result);
    });
    return list;
  };
  const AI_USER = {
    name: 'Pet Assistant AI',
    email: 'gemini@ai.com',
    avatar: require('./../../assets/images/ai.jpg'), // icon chatbot
    isAI: true,
  };
  const finalList = [AI_USER, ...MapOtherUserList()];

  return (
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
        Inbox
      </Text>
      <FlatList
        data={finalList}
        refreshing={loader}
        onRefresh={() => GetUserList()}
        style={{
          marginTop: 20,
        }}
        renderItem={({ item, index }) => <UserItem userInfo={item} key={index} />}
      />
    </View>
  );
}
