// AddNewPet/index.js
import { useUser } from '@clerk/clerk-expo';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRouter } from 'expo-router';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../../Config/FirebaseConfig';
import Colors from '../../constants/Colors';

export default function AddNewPet() {
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  const [formData, setFormData] = useState({
    category: '',
    sex: 'Male',
    price: '',
  });
  const [categoryList, setCategoryList] = useState([]);
  const [image, setImage] = useState();
  const [loader, setLoader] = useState(false);

  useEffect(
    () => {
      navigation.setOptions({ headerTitle: 'Add New Pet' });
      fetchCategories();
    },
    /* TODO: add missing dependencies */ [],
  );

  const handleInputChange = (field, value) => {
    if (field === 'price') {
      // loại bỏ ký tự không phải số
      const numeric = value.replace(/[^0-9]/g, '');

      // format số theo VN
      const formatted = numeric ? Number(numeric).toLocaleString('vi-VN') + ' đ' : '';

      setFormData((prev) => ({ ...prev, price: formatted, rawPrice: numeric }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, 'Category'));
    const categories = snapshot.docs.map((doc) => doc.data());
    setCategoryList(categories);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);

      try {
        // Upload tạm lên Cloudinary để lấy URL
        const formDataCloud = new FormData();
        formDataCloud.append('file', { uri, type: 'image/jpeg', name: `Pet-${Date.now()}.jpg` });
        formDataCloud.append('upload_preset', 'PetAdopt');

        const uploadResp = await fetch('https://api.cloudinary.com/v1_1/dkmgby3o9/image/upload', {
          method: 'POST',
          body: formDataCloud,
        });
        const uploadData = await uploadResp.json();

        if (uploadData.secure_url) {
          const imageUrl = uploadData.secure_url;

          // Gọi server AI phân loại category
          const classifyResp = await fetch('https://ai-server-utim.onrender.com/classify-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl }),
          });
          const classifyData = await classifyResp.json();
          console.log('⚠️ classifyData: ', JSON.stringify(classifyData, null, 2));

          if (
            !classifyData.category ||
            classifyData.category === 'Unknown' ||
            classifyData.category === ''
          ) {
            Alert.alert('Notice', 'Cannot identify pet category. Please select another image.', [
              { text: 'OK', onPress: () => setImage(null) },
            ]);
            handleInputChange('category', '');
            return;
          }
          console.log('Before handleInputChange:', classifyData.category);
          handleInputChange('category', classifyData.category);
        } else {
          ToastAndroid.show('Upload failed for AI classification', ToastAndroid.SHORT);
          setImage(null);
        }
      } catch (err) {
        console.error(err);
        ToastAndroid.show('Error in AI classification', ToastAndroid.SHORT);
        setImage(null);
      }
    }
  };

  const uploadAndSave = async () => {
    if (
      !formData.name ||
      !formData.category ||
      !formData.breed ||
      !formData.age ||
      !formData.sex ||
      !formData.weight ||
      !formData.rawPrice ||
      !formData.address ||
      !formData.about ||
      !image
    ) {
      ToastAndroid.show('Enter all details and select an image', ToastAndroid.SHORT);
      return;
    }

    setLoader(true);

    try {
      const formDataCloud = new FormData();
      formDataCloud.append('file', {
        uri: image,
        type: 'image/jpeg',
        name: `Pet-${Date.now()}.jpg`,
      });
      formDataCloud.append('upload_preset', 'PetAdopt');

      const uploadResp = await fetch('https://api.cloudinary.com/v1_1/dkmgby3o9/image/upload', {
        method: 'POST',
        body: formDataCloud,
      });
      const uploadData = await uploadResp.json();

      if (uploadData.secure_url) {
        const imageUrl = uploadData.secure_url;
        const docId = Date.now().toString();

        await setDoc(doc(db, 'Pets', docId), {
          ...formData,
          price: formData.rawPrice,
          imageUrl,
          username: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
          userImage: user?.imageUrl,
          id: docId,
          exchangeStatus:"pendingApproval"
        });

        ToastAndroid.show('Pet added successfully!', ToastAndroid.SHORT);
        router.replace('/(tabs)/home');
      } else {
        ToastAndroid.show('Image upload failed', ToastAndroid.SHORT);
      }
    } catch (err) {
      console.error(err);
      ToastAndroid.show('Save failed', ToastAndroid.SHORT);
    } finally {
      setLoader(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={{ padding: 20 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Add new pet for adoption</Text>

          <Pressable onPress={pickImage}>
            {!image ? (
              <Image
                source={require('./../../assets/images/placeholder.png')}
                style={styles.image}
              />
            ) : (
              <Image source={{ uri: image }} style={styles.image} />
            )}
          </Pressable>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pet Name *</Text>
            <TextInput
              style={styles.input}
              onChangeText={(value) => handleInputChange('name', value)}
              value={formData.name || ''}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pet Category *</Text>
            <Picker
              selectedValue={formData.category}
              style={styles.input}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              {categoryList.map((c, idx) => (
                <Picker.Item key={idx} label={c.name} value={c.name} />
              ))}
            </Picker>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Breed *</Text>
            <TextInput
              style={styles.input}
              onChangeText={(value) => handleInputChange('breed', value)}
              value={formData.breed || ''}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              onChangeText={(value) => handleInputChange('age', value)}
              value={formData.age || ''}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gender *</Text>
            <Picker
              selectedValue={formData.sex}
              style={styles.input}
              onValueChange={(value) => handleInputChange('sex', value)}
            >
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
            </Picker>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Weight *</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              onChangeText={(value) => handleInputChange('weight', value)}
              value={formData.weight || ''}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Price *</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              onChangeText={(value) => handleInputChange('price', value)}
              value={formData.price || ''}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={styles.input}
              onChangeText={(value) => handleInputChange('address', value)}
              value={formData.address || ''}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>About *</Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={5}
              onChangeText={(value) => handleInputChange('about', value)}
              value={formData.about || ''}
            />
          </View>

          <TouchableOpacity style={styles.button} disabled={loader} onPress={uploadAndSave}>
            {loader ? (
              <ActivityIndicator size="large" color={Colors.WHITE} />
            ) : (
              <Text style={styles.buttonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: 'outfit-medium', fontSize: 20, marginBottom: 10 },
  image: {
    width: 100,
    height: 100,
    borderRadius: 15,
    borderWidth: 1,
    backgroundColor: Colors.WHITE,
    marginVertical: 10,
  },
  inputContainer: { marginVertical: 5 },
  input: {
    padding: 15,
    backgroundColor: Colors.WHITE,
    borderRadius: 7,
    fontFamily: 'outfit',
    marginTop: 5,
    color: Colors.GRAY,
  },
  label: { fontFamily: 'outfit' },
  button: { padding: 15, backgroundColor: Colors.PRIMARY, borderRadius: 7, marginVertical: 10 },
  buttonText: { fontFamily: 'outfit-medium', textAlign: 'center', color: Colors.WHITE },
});
