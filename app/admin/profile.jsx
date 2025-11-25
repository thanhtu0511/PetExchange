import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
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
import { db } from '../../Config/FirebaseConfig';
import Colors from '../../constants/Colors';

export default function AdminProfile() {
  const auth = getAuth();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const fetchAdmin = async () => {
      if (!auth.currentUser) return;
      const uid = auth.currentUser.uid;
      const docRef = doc(db, 'Admin', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setAdmin(docSnap.data());
    };
    fetchAdmin();
  }, [auth.currentUser]);

  const pickAndUploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (result.canceled) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: `Admin-${Date.now()}.jpg`,
      });
      formData.append('upload_preset', 'PetAdopt');

      const uploadResp = await fetch('https://api.cloudinary.com/v1_1/dkmgby3o9/image/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await uploadResp.json();
      if (!data.secure_url) {
        ToastAndroid.show('Upload failed', ToastAndroid.SHORT);
        return;
      }

      setAdmin({ ...admin, imageUrl: data.secure_url });
      ToastAndroid.show('Image uploaded successfully', ToastAndroid.SHORT);
    } catch (err) {
      console.error(err);
      ToastAndroid.show('Upload error', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!admin.username || !admin.dateofbirth) {
      ToastAndroid.show('Username and Date of Birth are required', ToastAndroid.SHORT);
      return;
    }
    setLoading(true);
    try {
      const docRef = doc(db, 'Admin', admin.uid);
      await updateDoc(docRef, {
        username: admin.username,
        dateofbirth: admin.dateofbirth,
        imageUrl: admin.imageUrl,
      });
      ToastAndroid.show('Profile updated successfully', ToastAndroid.SHORT);
    } catch (err) {
      console.error(err);
      ToastAndroid.show('Update failed', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  if (!admin) return null;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={styles.title}>Profile</Text>

      <TouchableOpacity
        onPress={pickAndUploadImage}
        style={{ alignSelf: 'center', marginBottom: 20 }}
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
        ) : (
          <Image
            source={{ uri: admin.imageUrl }}
            style={{ width: 100, height: 100, borderRadius: 50 }}
          />
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={admin.username}
        onChangeText={(text) => setAdmin({ ...admin, username: text })}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, { backgroundColor: '#f0f0f0' }]}
        value={admin.email}
        editable={false}
      />

      <Text style={styles.label}>Role</Text>
      <TextInput
        style={[styles.input, { backgroundColor: '#f0f0f0' }]}
        value={admin.role}
        editable={false}
      />

      <Text style={styles.label}>Date of Birth</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
        <Text>{admin.dateofbirth}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={new Date(admin.dateofbirth)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) {
              setAdmin({ ...admin, dateofbirth: selectedDate.toISOString().split('T')[0] });
            }
          }}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontFamily: 'outfit-bold', marginBottom: 20 },
  label: { fontSize: 16, fontFamily: 'outfit-medium', marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontFamily: 'outfit',
  },
  button: {
    padding: 15,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'outfit-medium',
    fontSize: 18,
  },
});
