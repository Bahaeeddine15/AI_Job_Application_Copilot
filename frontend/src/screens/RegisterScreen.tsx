import React, { useState } from "react";
import { ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { registerUser } from "../services/AuthService";

export default function RegisterScreen({ navigation }: any) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const INPUT_TEXT_COLOR = "#2B1C16";
  const INPUT_PLACEHOLDER_COLOR = "#7A5A4A";

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const data = await registerUser(firstName, lastName, email, password);
      console.log("Registration success:", data);

      navigation.navigate("Login");
    } catch (err: any) {
      console.log("Registration error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our job application assistant</Text>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Register</Text>

              <TextInput
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
                mode="outlined"
                style={styles.input}
                outlineColor="#D9A883"
                activeOutlineColor="#623528"
                textColor={INPUT_TEXT_COLOR}
                placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
                theme={{ colors: { onSurfaceVariant: INPUT_PLACEHOLDER_COLOR } }}
              />

              <TextInput
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
                mode="outlined"
                style={styles.input}
                outlineColor="#D9A883"
                activeOutlineColor="#623528"
                textColor={INPUT_TEXT_COLOR}
                placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
                theme={{ colors: { onSurfaceVariant: INPUT_PLACEHOLDER_COLOR } }}
              />

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                style={styles.input}
                outlineColor="#D9A883"
                activeOutlineColor="#623528"
                textColor={INPUT_TEXT_COLOR}
                placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
                theme={{ colors: { onSurfaceVariant: INPUT_PLACEHOLDER_COLOR } }}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                style={styles.input}
                outlineColor="#D9A883"
                activeOutlineColor="#623528"
                textColor={INPUT_TEXT_COLOR}
                placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
                theme={{ colors: { onSurfaceVariant: INPUT_PLACEHOLDER_COLOR } }}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                    color="#623528"
                  />
                }
              />

              <TextInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                style={styles.input}
                outlineColor="#D9A883"
                activeOutlineColor="#623528"
                textColor={INPUT_TEXT_COLOR}
                placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
                theme={{ colors: { onSurfaceVariant: INPUT_PLACEHOLDER_COLOR } }}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    color="#623528"
                  />
                }
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                mode="contained"
                onPress={handleRegister}
                style={styles.button}
                buttonColor="#623528"
                textColor="#D9A883"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>

              <TouchableOpacity 
                onPress={() => navigation.navigate("Login")}
                style={styles.linkContainer}
              >
                <Text style={styles.linkText}>
                  Already have an account?{" "}
                  <Text style={styles.linkTextHighlight}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5EDE3",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#343434",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#956643",
    lineHeight: 22,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9A883",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#343434",
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    color: "#2B1C16",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 13,
    marginBottom: 12,
    fontWeight: "500",
  },
  button: {
    borderRadius: 8,
    marginTop: 8,
  },
  linkContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
    color: "#956643",
  },
  linkTextHighlight: {
    color: "#623528",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});