import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../../Config/FirebaseConfig';
import Colors from '../../constants/Colors';

export default function UpdatePet() {
  const navigation = useNavigation();
  const { petData } = useLocalSearchParams();
  const pet = JSON.parse(petData);
  const router = useRouter();
  const [formData, setFormData] = useState(pet || {});
  const [image, setImage] = useState(pet?.imageUrl);
  const [loader, setLoader] = useState(false);

  useEffect(
    () => {
      navigation.setOptions({
        headerTitle: 'Update Pet',
      });
    },
    /* TODO: add missing dependencies */ [],
  );

  const handleInputChange = (fieldName, fieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));
  };

  const imagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const onSubmit = () => {
    if (
      !formData.name ||
      !formData.age ||
      !formData.breed ||
      !formData.address ||
      !formData.about ||
      !formData.weight
    ) {
      ToastAndroid.show('Please fill all fields!', ToastAndroid.SHORT);
      return;
    }

    if (image !== formData.imageUrl) {
      UploadImage(); // nếu ảnh đã thay đổi
    } else {
      SaveData(formData.imageUrl); // giữ nguyên ảnh cũ
    }
  };

  const UploadImage = async () => {
    setLoader(true);

    const data = new FormData();
    data.append('file', {
      uri: image,
      type: 'image/jpeg',
      name: `pet-${Date.now()}.jpg`,
    });
    data.append('upload_preset', 'PetAdopt');

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dkmgby3o9/image/upload', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      if (result.secure_url) {
        SaveData(result.secure_url);
      } else {
        ToastAndroid.show('Image upload failed!', ToastAndroid.SHORT);
        setLoader(false);
      }
    } catch (error) {
      ToastAndroid.show('Upload error!', ToastAndroid.SHORT);
      setLoader(false);
    }
  };

  const SaveData = async (imageUrl) => {
    try {
      await setDoc(doc(db, 'Pets', pet.id), {
        ...formData,
        imageUrl: imageUrl,
      });
      ToastAndroid.show('Pet updated successfully!', ToastAndroid.SHORT);
      router.back();
    } catch (err) {
      ToastAndroid.show('Failed to update pet!', ToastAndroid.SHORT);
    }
    setLoader(false);
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontFamily: 'outfit-medium' }}>Update Pet</Text>

      <Pressable onPress={imagePicker}>
        <Image
          source={image ? { uri: image } : require('../../assets/images/placeholder.png')}
          style={{ width: 100, height: 100, borderRadius: 15, marginTop: 10 }}
        />
      </Pressable>

      {[
        { label: 'Pet Name', key: 'name' },
        { label: 'Breed', key: 'breed' },
        { label: 'Age', key: 'age', keyboardType: 'number-pad' },
        { label: 'Weight', key: 'weight', keyboardType: 'number-pad' },
        { label: 'Address', key: 'address' },
        { label: 'About', key: 'about', multiline: true },
      ].map((item, idx) => (
        <View key={idx} style={styles.inputContainer}>
          <Text style={styles.label}>{item.label} *</Text>
          <TextInput
            style={[styles.input, item.multiline && { height: 100 }]}
            multiline={item.multiline}
            keyboardType={item.keyboardType}
            value={formData[item.key]}
            onChangeText={(val) => handleInputChange(item.key, val)}
          />
        </View>
      ))}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Gender *</Text>
        <Picker
          selectedValue={formData.sex}
          style={styles.input}
          onValueChange={(val) => handleInputChange('sex', val)}
        >
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} disabled={loader} onPress={onSubmit}>
        {loader ? (
          <ActivityIndicator size="large" />
        ) : (
          <Text style={{ fontFamily: 'outfit-medium', textAlign: 'center' }}>Update</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 5,
  },
  input: {
    padding: 15,
    backgroundColor: Colors.WHITE,
    borderRadius: 7,
    fontFamily: 'outfit',
  },
  label: {
    fontFamily: 'outfit',
  },
  button: {
    padding: 15,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 7,
    marginVertical: 10,
    marginBottom: 50,
  },
});
