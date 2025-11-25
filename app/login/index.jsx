import { useOAuth } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from './../../constants/Colors';

export const useWarmUpBrowser = () => {
  React.useEffect(
    () => {
      void WebBrowser.warmUpAsync();
      return () => {
        void WebBrowser.coolDownAsync();
      };
    },
    /* TODO: add missing dependencies */ [],
  );
};

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  useWarmUpBrowser();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const onPress = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/(tabs)/home', { scheme: 'finalproject' }),
      });
      if (createdSessionId) {
        setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error('OAuth error', err);
    }
  }, [startOAuthFlow]); // ✅ thêm dependency để fix warning

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <View style={{ flex: 1 }}>
        <Image
          source={require('./../../assets/images/login.png')}
          style={{ width: '100%', height: 430 }}
        />

        <View style={{ flex: 1, padding: 20, justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                fontFamily: 'outfit-bold',
                fontSize: 30,
                textAlign: 'center',
              }}
            >
              Ready to make a new friend?
            </Text>

            <Text
              style={{
                fontFamily: 'outfit',
                fontSize: 18,
                textAlign: 'center',
                color: Colors.GRAY,
                marginTop: 10,
              }}
            >
              Let&apos;s adopt the pet which you like and make their life happy again
            </Text>
          </View>

          {/* Container 2 nút ở đáy */}
          <View style={{ width: '100%' }}>
            <Pressable
              onPress={onPress}
              style={{
                padding: 14,
                backgroundColor: Colors.PRIMARY,
                width: '100%',
                borderRadius: 14,
              }}
            >
              <Text
                style={{
                  fontFamily: 'outfit-medium',
                  fontSize: 20,
                  textAlign: 'center',
                  color: Colors.WHITE,
                }}
              >
                Get Started
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/admin/admin-login')}
              style={{
                padding: 14,
                marginTop: 12,
                borderWidth: 1,
                borderColor: Colors.GRAY,
                width: '100%',
                borderRadius: 14,
              }}
            >
              <Text
                style={{
                  fontFamily: 'outfit-medium',
                  fontSize: 20,
                  textAlign: 'center',
                  color: Colors.GRAY,
                }}
              >
                Login as Admin
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
