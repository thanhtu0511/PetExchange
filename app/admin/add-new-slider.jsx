import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import { useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../../Config/FirebaseConfig';
import Colors from '../../constants/Colors';
export default function AddNewSlider() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Add New Slider',
    });
  }, [navigation]);
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadAndSave = async () => {
    if (!image) {
      ToastAndroid.show('Please select an image', ToastAndroid.SHORT);
      return;
    }
    setLoading(true);
    try {
      const formDataCloud = new FormData();
      formDataCloud.append('file', {
        uri: image,
        type: 'image/jpeg',
        name: `Slider-${Date.now()}.jpg`,
      });
      formDataCloud.append('upload_preset', 'PetAdopt');

      const uploadResp = await fetch('https://api.cloudinary.com/v1_1/dkmgby3o9/image/upload', {
        method: 'POST',
        body: formDataCloud,
      });

      const uploadData = await uploadResp.json();
      if (uploadData.secure_url) {
        const sliderId = Date.now().toString();
        await setDoc(doc(db, 'Sliders', sliderId), {
          imageUrl: uploadData.secure_url,
          id: sliderId,
        });
        ToastAndroid.show('Slider added successfully', ToastAndroid.SHORT);
        router.back();
      } else {
        ToastAndroid.show('Upload failed', ToastAndroid.SHORT);
      }
    } catch (err) {
      console.error(err);
      ToastAndroid.show('Error uploading', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20, paddingBottom: insets.bottom }}>
      <Text style={styles.title}>Add New Slider</Text>

      <TouchableOpacity onPress={pickImage}>
        {!image ? (
          <Image source={require('./../../assets/images/placeholder.png')} style={styles.image} />
        ) : (
          <Image source={{ uri: image }} style={styles.image} />
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={uploadAndSave} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={Colors.WHITE} />
        ) : (
          <Text style={styles.buttonText}>Submit</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: 'outfit-medium', fontSize: 20, marginBottom: 10 },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 15,
    backgroundColor: Colors.WHITE,
    marginBottom: 15,
  },
  button: { padding: 15, backgroundColor: Colors.PRIMARY, borderRadius: 10 },
  buttonText: { color: '#fff', fontFamily: 'outfit-medium', textAlign: 'center' },
});
