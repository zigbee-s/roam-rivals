import React from 'react';
import { View, ScrollView } from 'react-native';
import CompetitionCard2 from './CompetitionCard2';

const formatDate = (dateString) => {
  const options = { weekday: 'short', day: '2-digit', month: 'short' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const VerticalCardList = ({ data, styles, navigation, userEvents, activeTab }) => (
  <ScrollView contentContainerStyle={styles.verticalCardListContainer}>
    {data.map(item => (
      <View key={item._id} style={styles.verticalCardWrapper}>
        <CompetitionCard2
          title={item.title}
          duration={item.duration || '10 Min'}
          startDate={formatDate(item.startingDate)}
          endDate={formatDate(item.eventEndDate)}
          startTime={new Date(item.startingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          endTime={new Date(item.eventEndDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          event={item}
          navigation={navigation}
          isRegistered={userEvents.some(e => e._id === item._id)}
          activeTab={activeTab}
        />
      </View>
    ))}
  </ScrollView>
);

export default VerticalCardList;
