import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const Tabs = ({ styles, activeTab, setActiveTab }) => (
  <View style={styles.tabsContainer}>
    <Text style={styles.competitionText}>Competitions:</Text>
    <TouchableOpacity
      style={[styles.tabLatest, activeTab === 'latest' && styles.activeTab]}
      onPress={() => setActiveTab('latest')}
    >
      <Text style={[styles.tabText, activeTab === 'latest' && styles.activeTabText]}>Latest</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.tabUpcoming, activeTab === 'registered' && styles.activeTab]}
      onPress={() => setActiveTab('registered')}
    >
      <Text style={[styles.tabText, activeTab === 'registered' && styles.activeTabText]}>Registered</Text>
    </TouchableOpacity>
  </View>
);

export default Tabs;
