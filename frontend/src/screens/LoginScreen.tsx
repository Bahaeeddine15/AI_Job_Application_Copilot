import React, { useState } from "react";
import { ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { loginUser } from "../services/AuthService";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const data = await loginUser(email, password);
      console.log("Login success:", data);

      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (err: any) {
      console.log("Login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
    // bloc for testing error handling without backend
    // try {
    // catch (err: any) {
    //   const backendMsg = err?.response?.data?.message;
    //   const networkMsg = err?.message;
    //   const statusCode = err?.response?.status;
    //   console.log("LOGIN STATUS:", statusCode);
    //   console.log("LOGIN ERROR:", err?.response?.data || err);
    //   setError(backendMsg || networkMsg || "Login failed. Please try again.");
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Login</Text>

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                style={styles.input}
                outlineColor="#D9A883"
                activeOutlineColor="#623528"
                textColor="#2B1C16"
                placeholderTextColor="#7A5A4A"
                theme={{ colors: { onSurfaceVariant: "#7A5A4A" } }}
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
                textColor="#2B1C16"
                placeholderTextColor="#7A5A4A"
                theme={{ colors: { onSurfaceVariant: "#7A5A4A" } }}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                    color="#623528"
                  />
                }
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.button}
                buttonColor="#623528"
                textColor="#D9A883"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <TouchableOpacity 
                onPress={() => navigation.navigate("Register")}
                style={styles.linkContainer}
              >
                <Text style={styles.linkText}>
                  Don't have an account?{" "}
                  <Text style={styles.linkTextHighlight}>Create Account</Text>
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