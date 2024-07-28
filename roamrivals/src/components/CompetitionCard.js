import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.75;
const cardHeight = screenWidth * 0.5;

const CompetitionCard = ({ title, startDate, endDate, startTime, endTime, event, navigation, buttonText, eventType }) => {
  const handleRegister = () => {
    navigation.navigate('QuizLandingScreen', { event });
  };

  return (
    <View style={styles.card}>
      <Image source={require('../../assets/cardimage.png')} style={styles.image} />
      <View style={styles.overlay}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.datesContainer}>
          <View style={styles.arrowDateBlock}>
            <Image source={require('../../assets/Union.png')} style={styles.arrowBackground} />
            <View style={styles.dateContent}>
              {eventType === 'quiz' && (
                <>
                  <Image source={require('../../assets/python_icon2.png')} style={styles.icon} />
                  <Image source={require('../../assets/Line.png')} style={styles.lineicon} />
                </>
              )}
              {eventType === 'photography' && (
                <>
                  <Image source={require('../../assets/python_icon2.png')} style={styles.icon} />
                  <Image source={require('../../assets/Line.png')} style={styles.lineicon} />
                </>
              )}
              <View style={styles.dateTextContainer}>
                <Text style={styles.date}>{startDate}</Text>
                <Text style={styles.time}>{startTime}</Text>
              </View>
            </View>
          </View>
          <View style={styles.endDateBlock}>
            <Text style={styles.date_second}>{endDate}</Text>
            <Text style={styles.time_second}>{endTime}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    top: 0,
    left: cardWidth * 0.32,
    right: 0,
    bottom: 0,
    backgroundColor: '#F9A825',
    padding: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: cardHeight * 0.1,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: cardHeight * -0.6,
  },
  datesContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: cardHeight * 0.05,
  },
  arrowDateBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    height: cardWidth * 0.13,
    left: -cardWidth * 0.001,
  },
  arrowBackground: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '115%',
    height: '100%',
    resizeMode: 'stretch',
  },
  dateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  icon: {
    width: 20,
    height: 20,
    marginLeft: 5,
  },
  lineicon: {
    width: 1,
    height: 25,
    margin: 5,
  },
  dateTextContainer: {
    alignItems: 'center',
  },
  date: {
    fontSize: cardWidth * 0.04,
    fontWeight: 'bold',
    color: '#4F4F4F',
  },
  date_second: {
    fontSize: cardWidth * 0.04,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  time: {
    fontSize: cardWidth * 0.045,
    fontWeight: 'bold',
    color: '#4F4F4F',
  },
  time_second: {
    fontSize: cardWidth * 0.045,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  endDateBlock: {
    alignItems: 'center',
    paddingVertical: 2,
    right: cardWidth * -0.06,
  },
  button: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    width: cardWidth * 0.4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
    left: cardWidth * 0.13,
    top: cardHeight * 0.4,
    alignItems: 'center',
    marginTop: cardHeight * 0.38,
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'semibold',
    fontSize: 16,
  },
});

export default CompetitionCard;
