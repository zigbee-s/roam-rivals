import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  ActivityIndicator,
  Dimensions,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Formik } from "formik";
import * as yup from "yup";
import apiClient from "../apiClient";

const validationSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  age: yup
    .string()
    .required("Age is required")
    .matches(/^[0-9]+$/, "Invalid age"),
});

const SignupScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignup = async (values, actions) => {
    try {
      setLoading(true);
      await apiClient.post("/auth/signup", values);
      setLoading(false);
      navigation.navigate("Verification", { signupData: values });
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("An unexpected error occurred");
      }
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Formik
            initialValues={{ name: "", email: "", password: "", age: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSignup}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isSubmitting,
            }) => (
              <View style={styles.formWrapper}>
                <View style={styles.header}>
                  <Image
                    source={require("../assets/Registration.png")}
                    style={styles.image}
                  />
                </View>
                <View style={styles.formBackground}>
                  <View style={styles.form}>
                    <TextInput
                      style={styles.input}
                      placeholder="Name"
                      placeholderTextColor="#888"
                      onChangeText={handleChange("name")}
                      onBlur={handleBlur("name")}
                      value={values.name}
                    />
                    {touched.name && errors.name && (
                      <Text style={styles.errorText}>{errors.name}</Text>
                    )}
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="#888"
                      keyboardType="email-address"
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      value={values.email}
                    />
                    {touched.email && errors.email && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#888"
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      value={values.password}
                      secureTextEntry
                    />
                    {touched.password && errors.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                    <TextInput
                      style={styles.input}
                      placeholder="Age"
                      placeholderTextColor="#888"
                      keyboardType="numeric"
                      onChangeText={handleChange("age")}
                      onBlur={handleBlur("age")}
                      value={values.age}
                    />
                    {touched.age && errors.age && (
                      <Text style={styles.errorText}>{errors.age}</Text>
                    )}
                    {errorMessage ? (
                      <Text style={styles.errorText}>{errorMessage}</Text>
                    ) : null}
                    <TouchableOpacity
                      style={[
                        styles.button,
                        values.name &&
                          values.email &&
                          values.password &&
                          values.age &&
                          styles.buttonActive,
                      ]}
                      onPress={handleSubmit}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.buttonText}>Next</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </Formik>
        )}
      </View>
    </ScrollView>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00072D",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  formWrapper: {
    flex: 1,
    width: "100%",
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: height * 0.05,
  },
  image: {
    width: width * 0.8,
    height: height * 0.3,
    resizeMode: "contain",
  },
  formBackground: {
    flex: 1,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.03,
    alignItems: "center",
    marginTop: height * 0.03,
  },
  form: {
    width: "100%",
    justifyContent: "center",
  },
  input: {
    width: "100%",
    height: height * 0.07,
    borderColor: "#CCCCCC",
    borderWidth: 1,
    borderRadius: width * 0.02,
    paddingHorizontal: width * 0.025,
    marginBottom: height * 0.015,
    backgroundColor: "#FFFFFF",
  },
  errorText: {
    color: "red",
    marginBottom: height * 0.01,
    marginTop: -height * 0.01,
  },
  button: {
    width: "100%",
    height: height * 0.07,
    backgroundColor: "#696969",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: width * 0.02,
    marginTop: height * 0.09,
  },
  buttonActive: {
    backgroundColor: "#000A23",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default SignupScreen;
