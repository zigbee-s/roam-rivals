import React, { useRef, useEffect, useState } from 'react';
import { View, FlatList, Dimensions } from 'react-native';
import CompetitionCard from './CompetitionCard';

const { width } = Dimensions.get('window');

const HorizontalCardList = ({ data, styles, navigation, userEvents }) => {
  const itemWidth = styles.cardWrapper.width;
  const itemMargin = styles.cardWrapper.marginHorizontal;
  const sidePadding = (width - itemWidth) / 2; // Padding to center the card
  const snapToInterval = itemWidth + itemMargin * 2; // Snap interval includes margin on both sides of the card

  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Scroll to the initial index to center the first card
    if (flatListRef.current && data.length > 0) {
      flatListRef.current.scrollToOffset({ offset: currentIndex * snapToInterval, animated: false });
    }
  }, [data.length, currentIndex, snapToInterval]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % data.length;
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ offset: nextIndex * snapToInterval, animated: true });
        }
        return nextIndex;
      });
    }, 5000); // 5 seconds

    return () => clearInterval(intervalId); // Clean up the interval on unmount
  }, [data.length, snapToInterval]);

  const handleScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / snapToInterval);
    flatListRef.current.scrollToOffset({ offset: index * snapToInterval, animated: false });
    setCurrentIndex(index);
  };

  const isUserRegistered = (eventId) => {
    return userEvents.some(e => e._id === eventId);
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'short', day: '2-digit', month: 'short' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <View style={styles.cardListContainer}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <CompetitionCard
              title={item.title}
              startDate={formatDate(item.startingDate)}
              endDate={formatDate(item.eventEndDate)}
              startTime={new Date(item.startingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              endTime={new Date(item.eventEndDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              event={item}
              navigation={navigation}
              buttonText={isUserRegistered(item._id) ? 'See Details' : 'Register Now'}
              eventType={item.eventType}
            />
          </View>
        )}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: sidePadding }} // Padding only on the sides
        snapToAlignment="start"
        decelerationRate="normal" // Increase speed of adjustment
        scrollEventThrottle={100} // Improves responsiveness of onMomentumScrollEnd
        snapToInterval={snapToInterval}
        pagingEnabled
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd} // Also handle the scroll end drag event
      />
    </View>
  );
};

export default HorizontalCardList;
