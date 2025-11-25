import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db } from '../../Config/FirebaseConfig';
import Colors from '../../constants/Colors';
export default function AddNewAdmin() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [roles, setRoles] = useState([]);
  const [role, setRole] = useState('');
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Add New Admin', // Tiêu đề hiển thị trên header
    });
  }, [navigation]);
  useEffect(
    () => {
      const fetchRoles = async () => {
        try {
          const snapshot = await getDocs(collection(db, 'RoleAdmin'));
          const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setRoles(list);
          if (list.length > 0) setRole(list[0]);
        } catch (err) {
          console.error('Fetch roles error:', err);
        }
      };

      fetchRoles();
    },
    /* TODO: add missing dependencies */ [],
  );
  // Pick image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const uploadAndSave = async () => {
    if (!username || !email || !password || !image) {
      ToastAndroid.show('Please fill all fields and select an avatar', ToastAndroid.SHORT);
      return;
    }

    setLoading(true);

    try {
      // 1. Tạo user Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Upload ảnh lên Cloudinary
      const formDataCloud = new FormData();
      formDataCloud.append('file', {
        uri: image,
        type: 'image/jpeg',
        name: `Admin-${Date.now()}.jpg`,
      });
      formDataCloud.append('upload_preset', 'PetAdopt');

      const uploadResp = await fetch('https://api.cloudinary.com/v1_1/dkmgby3o9/image/upload', {
        method: 'POST',
        body: formDataCloud,
      });

      const uploadData = await uploadResp.json();
      if (!uploadData.secure_url) {
        ToastAndroid.show('Upload failed', ToastAndroid.SHORT);
        setLoading(false);
        return;
      }

      // 3. Lưu thông tin admin vào Firestore
      await setDoc(doc(db, 'Admin', uid), {
        uid,
        username,
        email,
        imageUrl: uploadData.secure_url,
        dateofbirth: dateOfBirth.toISOString().split('T')[0],
        role,
      });

      ToastAndroid.show('Admin added successfully', ToastAndroid.SHORT);

      // Reset form
      setUsername('');
      setEmail('');
      setPassword('');
      setImage(null);
      setDateOfBirth(new Date());
      setRole('admin');
    } catch (err) {
      console.error(err);
      ToastAndroid.show('Error: ' + err.message, ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 20, paddingBottom: insets.bottom }}>
      <Text style={styles.title}>Add New Admin</Text>

      <TouchableOpacity onPress={pickImage}>
        {!image ? (
          <Image source={require('./../../assets/images/placeholder.png')} style={styles.avatar} />
        ) : (
          <Image source={{ uri: image }} style={styles.avatar} />
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* DatePicker */}
      <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
        <Text>{dateOfBirth.toISOString().split('T')[0]}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={dateOfBirth}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDateOfBirth(selectedDate);
          }}
        />
      )}

      <View style={[styles.input, { padding: 0 }]}>
        <Picker selectedValue={role} onValueChange={setRole} mode="dropdown">
          {roles.map((r) => (
            <Picker.Item key={r.id} label={r.name} value={r.name} />
          ))}
        </Picker>
      </View>

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
  avatar: {
    width: '100%',
    height: 180,
    borderRadius: 15,
    backgroundColor: Colors.WHITE,
    marginBottom: 15,
  },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, marginBottom: 15 },
  button: { padding: 15, backgroundColor: Colors.PRIMARY, borderRadius: 10 },
  buttonText: { color: '#fff', fontFamily: 'outfit-medium', textAlign: 'center' },
});
