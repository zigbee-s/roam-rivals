import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import BackButton from '../components/BackButton';
import apiClient from '../api/apiClient';
import { ErrorContext } from '../context/ErrorContext';
import { UserContext } from '../context/UserContext';

const { width, height } = Dimensions.get('window');

const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const source = i <= rating ? require('../../assets/star_filled.png') : require('../../assets/star_empty.png');
    stars.push(<Image key={i} source={source} style={styles.star} />);
  }
  return <View style={styles.starsContainer}>{stars}</View>;
};

const formatDate = (date) => {
  const options = { day: 'numeric', month: 'long' };
  const formattedDate = new Date(date).toLocaleDateString('en-GB', options);
  const formattedTime = new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${formattedDate} ${formattedTime}`;
};

const getTimeRemaining = (endDate) => {
  const total = Date.parse(endDate) - Date.now();
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const seconds = Math.floor((total / 1000) % 60);
  return { total, days, hours, minutes, seconds };
};

const QuizLandingScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const { setError } = useContext(ErrorContext);
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(event.startingDate));
  const [submissionTimeRemaining, setSubmissionTimeRemaining] = useState(getTimeRemaining(event.PhotosubmissionDeadline));
  const [isEventEnded, setIsEventEnded] = useState(false);
  const [isSubmissionDeadlineOver, setIsSubmissionDeadlineOver] = useState(false);

  useEffect(() => {
    const fetchRegistrationStatus = async () => {
      try {
        const response = await apiClient.get(`/events/check-registration/${event._id}`, { params: { userId: user._id } });
        setRegistered(response.data.isRegistered);
      } catch (error) {
        setError('Failed to fetch registration status.');
      }
    };

    const checkEventStatus = () => {
      const currentDateTime = new Date();
      const eventEndDateTime = new Date(event.eventEndDate);
      const submissionDeadlineDateTime = new Date(event.PhotosubmissionDeadline);

      setIsSubmissionDeadlineOver(currentDateTime > submissionDeadlineDateTime);

      if (currentDateTime > eventEndDateTime) {
        setIsEventEnded(true);
      } else {
        setIsEventEnded(false);
      }
    };

    // Print event data to the terminal
    console.log('Event data:', event);

    fetchRegistrationStatus();
    checkEventStatus();

    const timer = setInterval(() => {
      setTimeRemaining(getTimeRemaining(event.startingDate));
      setSubmissionTimeRemaining(getTimeRemaining(event.PhotosubmissionDeadline));
    }, 1000);

    return () => clearInterval(timer);
  }, [event, user._id, setError]);

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/events/register', { eventId: event._id, userId: user._id });
      if (response.data.message === 'You are already registered for this event') {
        setRegistered(true);
      } else {
        Alert.alert('Success', response.data.message);
        setRegistered(true);
      }
    } catch (error) {
      if (!error.response) {
        setError('Unable to connect to the backend. Please try again later.');
      } else if (error.response.status === 403) {
        setError('Access forbidden: You do not have permission to access this resource.');
      } else {
        setError(error.response.data.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    navigation.navigate('PhotoGraphyScreen', { eventId: event._id });
  };

  const handleViewSubmissions = () => {
    navigation.navigate('PhotoGalleryScreen', { eventId: event._id });
  };

  if (isEventEnded) {
    return (
      <View style={styles.container}>
        <Text style={styles.endedText}>This event has ended.</Text>
        <BackButton onPress={() => navigation.navigate('Events')} style={styles.backButton} />
      </View>
    );
  }

  const isEventStarted = new Date(event.startingDate) <= new Date();
  const isQuizEvent = event.eventType === 'quiz';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        {event.logoPresignedUrl ? (
          <Image source={{ uri: event.logoPresignedUrl }} style={styles.image} />
        ) : (
          <Text>No image available</Text>
        )}
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.subtitle}>
          From {formatDate(event.startingDate)}
          {"\n"}To {formatDate(event.eventEndDate)}
        </Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.rule_column} onPress={() => setModalVisible(true)}>
            <View style={styles.rulesIconContainer}>
              <Image source={require('../../assets/rules_icon.png')} style={styles.rulesIcon} />
              <Text style={styles.overlayText}>Click for competition rules</Text>
            </View>
          </TouchableOpacity>
          {isQuizEvent && (
            <View style={styles.python_column}>
              <Image source={require('../../assets/python_icon.png')} style={styles.icon} />
            </View>
          )}
        </View>
        <View style={styles.star_row}>
          <Text style={styles.difficultyLabel}>Difficulty :</Text>
          <StarRating rating={event.difficulty} />
        </View>
        {isQuizEvent && (
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Image source={require('../../assets/time_icon.png')} style={styles.infoIcon} />
              <Text style={styles.infoText}><Text style={styles.largeText}>10</Text> {"\n"}Minutes</Text>
            </View>
            <View style={styles.infoRow}>
              <Image source={require('../../assets/questions_icon.png')} style={styles.infoIcon} />
              <Text style={styles.infoText}><Text style={styles.largeText}>10</Text> {"\n"}Questions</Text>
            </View>
          </View>
        )}
        {event.eventType === 'photography' && (
          <View style={styles.infoContainer}>
            <Text style={styles.themesTitle}>Themes: </Text>
            {event.themes.map((theme, index) => (
              <Text key={index} style={styles.themeText}>{theme} </Text>
            ))}
          </View>
        )}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Image source={require('../../assets/entry_fee_icon.png')} style={styles.infoIcon} />
            <Text style={styles.infoText}><Text style={styles.largeText}>{event.entryFee} Rs.</Text>{"\n"}Entry Fee</Text>
          </View>
        </View>
        {isEventStarted && event.eventType === 'photography' && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              Photo Submission Deadline: {formatDate(event.PhotosubmissionDeadline)}
            </Text>
          </View>
        )}
        {isSubmissionDeadlineOver && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              Photo Submission Deadline is over
            </Text>
          </View>
        )}
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {isEventStarted ? '' : `Event starts in: ${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s`}
          </Text>
        </View>
        <View style={styles.buttonRow}>
          <BackButton onPress={() => navigation.navigate('Events')} style={styles.backButton} />
          <TouchableOpacity
            style={[
              styles.registerButton,
              registered && !isEventStarted && styles.registeredButton,
              registered && isEventStarted && !isSubmissionDeadlineOver && styles.joinButton,
              registered && isSubmissionDeadlineOver && styles.viewSubmissionsButton,
              !registered && isEventStarted && styles.notRegisteredButton,
            ]}
            onPress={
              registered && isEventStarted && isSubmissionDeadlineOver
                ? handleViewSubmissions
                : registered && isEventStarted
                ? handleJoin
                : handleRegister
            }
            disabled={loading || (!registered && isEventStarted) || (registered && !isEventStarted)}
          >
            <Text style={[
              styles.registerButtonText,
              registered && !isEventStarted && styles.registeredButtonText,
              registered && isEventStarted && !isSubmissionDeadlineOver && styles.registerButtonText,
              registered && isSubmissionDeadlineOver && styles.viewSubmissionsButtonText,
              !registered && isEventStarted && styles.notRegisteredButtonText,
            ]}>
              {loading ? 'Registering...' : registered ? (isEventStarted ? (isSubmissionDeadlineOver ? 'View Submissions' : 'Join') : 'Registered') : (isEventStarted ? 'Not Registered' : 'Register')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rules & Regulations</Text>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <Text style={styles.modalText}>
                <Text style={styles.boldText}>• Question Design:</Text> Set of MCQs covering various topics related to coding, algorithms, data structures, and programming languages. All questions have a single correct answer.{"\n\n"}
                <Text style={styles.boldText}>• Difficulty Level:</Text> Questions include varying difficulty to cater to participants with different skill levels.{"\n\n"}
                <Text style={styles.boldText}>• Time Limit:</Text> Each MCQ has a 30sec time limit to prevent participants from spending too much time on a single question.{"\n\n"}
                <Text style={styles.boldText}>• Scoring System:</Text> The Scoring system rewards correct answers and penalizes incorrect ones. Factors like speed and accuracy are considered in ranking.
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.continueButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: width,
    height: height * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0', // Add a background color in case the image fails to load
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: width * 0.05,
    marginTop: -height * 0.06,
    paddingLeft: height * 0.03,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'left',
    marginBottom: height * 0.01,
    marginTop: width * 0.02,
  },
  subtitle: {
    fontSize: width * 0.04,
    color: '#666',
    textAlign: 'left',
    marginBottom: height * 0.02,
  },
  overlayText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    padding: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: height * 0.02,
  },
  python_column: {
    marginTop: -height * 0.045,
  },
  rule_column: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rulesIconContainer: {
    position: 'relative',
    width: width * 0.67,
    height: width * 0.08,
    justifyContent: 'center',
    alignItems: 'center',
  },
  star_row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: height * 0.02,
  },
  rulesIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
  },
  icon: {
    width: width * 0.15,
    height: width * 0.15,
    resizeMode: 'contain',
  },
  difficultyLabel: {
    fontSize: width * 0.04,
    color: '#000',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    width: width * 0.05,
    height: width * 0.05,
    resizeMode: 'contain',
  },
  infoContainer: {
    marginBottom: height * 0.02,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  infoIcon: {
    width: width * 0.055,
    height: width * 0.055,
    resizeMode: 'contain',
    marginRight: width * 0.02,
  },
  infoText: {
    fontSize: width * 0.04,
    color: '#666',
  },
  largeText: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
  },
  themesTitle: {
    fontSize: width * 0.05,
    color: '#666',
    fontWeight: 'bold',
  },
  themeText: {
    fontSize: width * 0.04,
    color: '#666',
  },
  timerContainer: {
    marginTop: width * 0.01,
    alignItems: 'center',
  },
  timerText: {
    fontSize: width * 0.035,
    color: '#FF0000',
  },
  endedText: {
    fontSize: width * 0.05,
    color: '#FF0000',
    textAlign: 'center',
    marginVertical: height * 0.02,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: height * 0.03,
  },
  backButton: {
    width: '20%',
    height: height * 0.07,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: width * 0.02,
    borderColor: '#CCCCCC',
    borderWidth: 1,
  },
  registerButton: {
    width: '70%',
    backgroundColor: '#000A23',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.2,
    borderRadius: width * 0.02,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: width * 0.05,
    fontWeight: '600',
  },
  registeredButton: {
    width: '70%',
    backgroundColor: '#696969',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.2,
    borderRadius: width * 0.02,
    alignItems: 'center',
  },
  registeredButtonText: {
    color: '#fff',
    fontSize: width * 0.05,
    fontWeight: '600',
  },
  joinButton: {
    width: '70%',
    backgroundColor: '#000A23',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.2,
    borderRadius: width * 0.02,
    alignItems: 'center',
  },
  notRegisteredButton: {
    width: '70%',
    backgroundColor: '#000A23',
    paddingVertical: height * 0.025,
    paddingHorizontal: width * 0.2,
    borderRadius: width * 0.02,
    alignItems: 'center',
  },
  notRegisteredButtonText: {
    color: '#fff',
    fontSize: width * 0.035,
    fontWeight: '600',
  },
  viewSubmissionsButton: {
    width: '70%',
    backgroundColor: '#1A1A2E',
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.2,
    borderRadius: width * 0.02,
    alignItems: 'center',
  },
  viewSubmissionsButtonText: {
    color: '#fff',
    fontSize: width * 0.035, // Adjust font size to fit text within the button
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.9,
    height: width * 1.2,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: width * 0.05,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: width * 0.06,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: height * 0.02,
  },
  modalScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  modalText: {
    fontSize: width * 0.04,
    color: '#666',
    textAlign: 'left',
  },
  boldText: {
    fontWeight: '700',
  },
  continueButton: {
    backgroundColor: '#000A23',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.2,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: height * 0.02,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: width * 0.05,
    fontWeight: '600',
  },
});

export default QuizLandingScreen;
