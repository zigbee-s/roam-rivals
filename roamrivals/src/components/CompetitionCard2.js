import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.85;
const cardHeight = screenWidth * 0.45;

const StarRating = ({ rating }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    const source = i <= rating ? require('../../assets/star_filled.png') : require('../../assets/star_empty.png');
    stars.push(<Image key={i} source={source} style={styles.star} />);
  }

  return <View style={styles.starsContainer}>{stars}</View>;
};

const CompetitionCard2 = ({ title, duration, startDate, endDate, startTime, endTime, event, navigation, isRegistered, activeTab }) => {
  const handlePress = () => {
    navigation.navigate('QuizLandingScreen', { event });
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.card}>
      <Image source={require('../../assets/cardimage.png')} style={styles.image} />
      <View style={styles.overlay}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.star_row}>
            <Text style={styles.duration}>Difficulty:</Text>
            <StarRating rating={event.difficulty} />
        </View>
        <Text style={styles.subtitle}>From {startDate}{"\n"}To {endDate}</Text>
        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>{isRegistered ? 'See Details' : 'Register Now!'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 1,
    margin: 10,
    height: cardHeight,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    right: cardWidth * 0.35,
    resizeMode: 'contain',
  },
  overlay: {
    position: 'absolute',
    top: cardWidth * -0.01,
    left: cardWidth * 0.3,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    padding: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: cardWidth * 0.05,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: cardHeight * -0.2,
    },
  subtitle: {
    fontSize: cardWidth * 0.04,
    color: '#666',
    textAlign: 'left',
    fontWeight: 'semibold',
    marginTop: cardWidth * -0.02,
  },
  button: {
    position: 'absolute',
    backgroundColor: '#08092C',
    width: cardWidth * 0.35,
    paddingVertical: cardHeight * 0.035,
    paddingHorizontal: cardWidth * 0.03,
    borderRadius: 5,
    left: cardWidth * 0.18,
    top: cardHeight * 0.8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'semibold',
    fontSize: cardWidth * 0.04,
  },
  star_row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: cardHeight * 0.08,
    marginBottom: cardHeight * 0.08,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    width: cardWidth * 0.05,
    height: cardWidth * 0.05,
    resizeMode: 'contain',
  },
});

export default CompetitionCard2;
