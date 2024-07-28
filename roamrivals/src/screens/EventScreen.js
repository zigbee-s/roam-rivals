import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Header from '../components/LoginpageHeader';
import HorizontalCardList from '../components/HorizontalCardList';
import Tabs from '../components/Tabs';
import VerticalCardList from '../components/VerticalCardList';
import apiClient from '../api/apiClient';
import { ErrorContext } from '../context/ErrorContext';
import { UserContext } from '../context/UserContext';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const coinText = "123456";
  const [horizontalData, setHorizontalData] = useState([]);
  const [verticalData, setVerticalData] = useState([]);
  const [filteredVerticalData, setFilteredVerticalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setError } = useContext(ErrorContext);
  const { user, updateUserProfile } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState('latest'); // New state for active tab

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchEvents();
      fetchUserProfile();
    }
  }, [isFocused]);

  useEffect(() => {
    filterEvents();
  }, [activeTab, verticalData, user]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/events');
      const currentEvents = response.data.filter(event => new Date(event.eventEndDate) > new Date());

      const sortedByStartingDate = currentEvents
        .filter(event => new Date(event.startingDate) > new Date()) // Exclude events that have already started
        .sort((a, b) => new Date(a.startingDate) - new Date(b.startingDate));
      const top5EarliestStartingEvents = sortedByStartingDate.slice(0, 5);
      setHorizontalData(top5EarliestStartingEvents);

      setVerticalData(sortedByStartingDate);
    } catch (error) {
      if (!error.response) {
        setError('Unable to connect to the backend. Please try again later.');
      } else {
        setError(error.response.data.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      await updateUserProfile();
    } catch (error) {
      setError('Failed to fetch user profile.');
    }
  };

  const filterEvents = () => {
    if (!user || !Array.isArray(user.events)) {
      setFilteredVerticalData([]);
      return;
    }
    
    if (activeTab === 'registered') {
      setFilteredVerticalData(verticalData.filter(event => user.events.some(e => e._id === event._id)));
    } else {
      setFilteredVerticalData(verticalData.filter(event => !user.events.some(e => e._id === event._id)));
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Header coinText={coinText} styles={styles} username={user?.name ?? ''} />
        <View style={styles.bottomBlueSection} />
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <HorizontalCardList data={horizontalData} styles={styles} navigation={navigation} userEvents={user?.events ?? []} />
        )}
        <Tabs styles={styles} activeTab={activeTab} setActiveTab={setActiveTab} />
        <VerticalCardList data={filteredVerticalData} styles={styles} navigation={navigation} userEvents={user?.events ?? []} activeTab={activeTab} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    flexGrow: 1,
  },
  header: {
    padding: width * 0.05,
    paddingTop: width * 0.15,
    paddingBottom: width * 0.15,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: height * 0.12,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileIconContainer: {
    position: 'relative',
  },
  profileIcon: {
    width: width * 0.15,
    height: width * 0.15,
    resizeMode: 'contain',
  },
  notificationBadge: {
    position: 'absolute',
    bottom: width * 0.001,
    left: width * 0.1,
    backgroundColor: 'orange',
    borderRadius: width * 0.05,
    paddingHorizontal: width * 0.02,
    paddingVertical: width * 0.01,
  },
  notificationBadgeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerLeft: {
    flexDirection: 'column',
    marginTop: height * 0.02,
  },
  welcomeText: {
    fontSize: width * 0.04,
    color: '#666',
  },
  username: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  walletContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinIcon: {
    width: width * 0.25,
    height: width * 0.15,
    resizeMode: 'contain',
  },
  coinText: {
    position: 'relative',
    bottom: width * 0.03,
    left: width * 0.04,
    marginTop: -width * 0.045,
    transform: [{ translateY: -width * 0.03 }],
    fontSize: width * 0.035,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cardListContainer: {
    marginTop: -height * 0.48,
  },
  cardList: {
    // Ensure padding for start and end is added dynamically in HorizontalCardList.js
  },
  cardWrapper: {
    width: width * 0.75, // Adjusted width of the card
    marginHorizontal: width * 0.025,
    alignItems: 'center',
  },
  tabsContainer: {
    height: width * 0.15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: width * 0.02,
    paddingLeft: width * 0.05,
    backgroundColor: '#FFFFFF',
    marginTop: height * 0.01,
    marginBottom: height * 0.02,
  },
  competitionText: {
    paddingRight: width * 0.1,
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginRight: width * 0.05,
  },
  tabLatest: {
    justifyContent: 'center',
    backgroundColor: '#A0A0A0',
    borderRadius: width * 0.03,
    paddingHorizontal: width * 0.05,
    paddingVertical: width * 0.02,
    marginLeft: width * -0.12,
  },
  tabUpcoming: {
    backgroundColor: '#A0A0A0',
    borderRadius: width * 0.03,
    paddingHorizontal: width * 0.05,
    paddingVertical: width * 0.02,
    marginLeft: width * 0.02,
  },
  activeTab: {
    backgroundColor: '#000A23',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: width * 0.035,
  },
  verticalCardListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalCardWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  bottomBlueSection: {
    position: 'relative',
    top: -width * 0.3,
    left: 0,
    right: 0,
    height: height * 0.3,
    backgroundColor: '#000A23',
    zIndex: -1,
  },
});

export default HomeScreen;
