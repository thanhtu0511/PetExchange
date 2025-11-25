// app/admin/AdminLogin.jsx
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useLayoutEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../Config/FirebaseConfig';
export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Login as Admin',
    });
  }, [navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      ToastAndroid.show('Enter email and password', ToastAndroid.SHORT);
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const adminRef = doc(db, 'Admin', uid);
      const adminSnap = await getDoc(adminRef);

      if (!adminSnap.exists()) {
        ToastAndroid.show('You are not an admin!', ToastAndroid.SHORT);
        setLoading(false);
        return;
      }

      ToastAndroid.show('Login successful!', ToastAndroid.SHORT);
      router.replace('/admin/dashboard');
    } catch (err) {
      ToastAndroid.show('Login failed: ' + err.message, ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <View style={styles.form}>
            <Text style={styles.title}>Admin Login</Text>

            <TextInput
              placeholder="Email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              placeholder="Password"
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
            </TouchableOpacity>
          </View>

          {/* Hình minh họa phía dưới */}
          <Image
            source={require('../../assets/images/meo_dang_yeu.jpg')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', backgroundColor: '#fff' },

  form: {
    padding: 25,
    marginTop: 50,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#1E90FF',
  },

  input: {
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#b9c6d9',
    fontSize: 16,
    backgroundColor: '#F1F6FF',
  },

  button: {
    padding: 15,
    backgroundColor: '#1E90FF',
    borderRadius: 12,
    marginTop: 15,
  },

  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 17 },

  image: {
    width: '100%',
    height: 220,
    marginBottom: 10,
    opacity: 0.9,
  },
});
