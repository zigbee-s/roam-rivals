import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Header = ({ coinText, styles, username }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <View style={styles.iconRow}>
        <TouchableOpacity style={styles.profileIconContainer} onPress={() => navigation.navigate('Profile')}>
          <Image source={require('../../assets/profile_icon.png')} style={styles.profileIcon} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>1</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.walletContainer}>
          <Image source={require('../../assets/wallet.png')} style={styles.coinIcon} />
          <Text style={[styles.coinText, { right: `${37 - coinText.length}%` }]}>{coinText}</Text>
        </View>
      </View>
      <View style={styles.headerLeft}>
        <Text style={styles.welcomeText}>Welcome Back!</Text>
        <Text style={styles.username}>{username}</Text>
      </View>
    </View>
  );
};

export default Header;
