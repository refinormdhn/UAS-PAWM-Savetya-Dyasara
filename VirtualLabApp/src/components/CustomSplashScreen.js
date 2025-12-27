import React from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';

const CustomSplashScreen = ({ fadeAnim, glitchAnim }) => {
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: Animated.multiply(fadeAnim, glitchAnim) }]}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.textContainer}>
          <Text style={styles.savetyaText}>SAVETYA</Text>
          <Text style={styles.space}> </Text>
          <Text style={styles.dyasaraText}>DYASARA</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savetyaText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a5f', // Navy blue
    letterSpacing: 2,
  },
  space: {
    width: 8,
  },
  dyasaraText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7c2d3a', // Maroon
    letterSpacing: 2,
  },
});

export default CustomSplashScreen;
