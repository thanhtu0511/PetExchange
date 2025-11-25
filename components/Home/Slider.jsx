import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, View } from 'react-native';
import { db } from './../../Config/FirebaseConfig';

export default function Slider() {
  const [sliderList, setSliderList] = useState([]);
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const screenWidth = Dimensions.get('screen').width;

  useEffect(() => {
    GetSliders();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (sliderList.length === 0) return;

      let nextIndex = currentIndex + 1;
      if (nextIndex >= sliderList.length) nextIndex = 0;
      flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 3000); // mỗi 3 giây tự chuyển

    return () => clearInterval(interval);
  }, [currentIndex, sliderList]);

  const GetSliders = async () => {
    setSliderList([]);
    const snapshot = await getDocs(collection(db, 'Sliders'));
    const sliders = [];
    snapshot.forEach((doc) => {
      sliders.push(doc.data());
    });
    setSliderList(sliders);
  };

  return (
    <View style={{ marginTop: 15 }}>
      <FlatList
        ref={flatListRef}
        data={sliderList}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View>
            <Image
              source={{ uri: item?.imageUrl }}
              style={[styles.sliderImage, { width: screenWidth * 0.9 }]}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sliderImage: {
    height: 170,
    borderRadius: 15,
    marginRight: 15,
  },
});
