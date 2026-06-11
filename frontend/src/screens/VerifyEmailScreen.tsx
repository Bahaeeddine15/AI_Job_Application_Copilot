import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Text, TextInput } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { verifyEmail, resendVerificationCode } from "../services/AuthService";

export default function VerifyEmailScreen({ route, navigation }) {
  const email = route?.params?.email || "";

  const [code, setCode] = useState("");
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVerify = async () => {
  if (!email || !code.trim()) {
    setError("Please enter the verification code.");
    return;
  }

  try {
    setLoadingVerify(true);
    setError("");
    setSuccess("");

    const result = await verifyEmail({
      email,
      code: code.trim(),
    });

    setSuccess(result?.message || "Email verified successfully.");

    setTimeout(() => {
      navigation.navigate("Login");
    }, 800);
  } catch (e: any) {
    console.log("Verify email error:", e.response?.data || e.message);

    setError(
      e.response?.data?.message ||
        e.message ||
        "Invalid or expired verification code."
    );
  } finally {
    setLoadingVerify(false);
  }
};

  const handleResend = async () => {
    if (!email) {
      setError("Email address is missing.");
      return;
    }

    try {
      setLoadingResend(true);
      setError("");
      setSuccess("");

      await resendVerificationCode({ email });

      setSuccess("A new verification code has been sent.");
    } catch (e) {
      const err = e;
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to resend verification code."
      );
    } finally {
      setLoadingResend(false);
    }
  };

  return (
    <View style={Platform.OS === "web" ? styles.webPage : styles.mobilePage}>
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons
                  name="email-check-outline"
                  size={46}
                  color="#623528"
                />
              </View>

              <Text style={styles.title}>Verify Your Email</Text>

              <Text style={styles.subtitle}>
                We sent a verification code to:
              </Text>

              <Text style={styles.email}>{email}</Text>

              <TextInput
                label="Verification code"
                value={code}
                onChangeText={setCode}
                mode="outlined"
                keyboardType="number-pad"
                style={styles.input}
                outlineColor="#D9A883"
                activeOutlineColor="#623528"
                textColor="#343434"
                placeholderTextColor="#956643"
                theme={{
                  colors: {
                    onSurfaceVariant: "#956643",
                  },
                }}
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              {success ? <Text style={styles.successText}>{success}</Text> : null}

              <Button
                mode="contained"
                style={styles.button}
                textColor="#D9A883"
                onPress={handleVerify}
                loading={loadingVerify}
                disabled={loadingVerify || loadingResend}
              >
                Verify Email
              </Button>

              <Button
                mode="text"
                textColor="#623528"
                onPress={handleResend}
                loading={loadingResend}
                disabled={loadingVerify || loadingResend}

              >
                Resend Code
              </Button>

              <Button
                mode="text"
                textColor="#956643"
                onPress={() => navigation.navigate("Login")}
                disabled={loadingVerify || loadingResend}
              >
                Back to Login
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webPage: {
    height: "100vh",
    overflowY: "auto",
    backgroundColor: "#F5EDE3",
  },

  mobilePage: {
    flex: 1,
    backgroundColor: "#F5EDE3",
  },

  container: {
    flex: 1,
    backgroundColor: "#F5EDE3",
  },

  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D9A883",
  },

  iconBox: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#F0E0CE",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 18,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#343434",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: "#956643",
    textAlign: "center",
    lineHeight: 22,
  },

  email: {
    fontSize: 15,
    color: "#343434",
    textAlign: "center",
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 22,
  },

  input: {
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },

  button: {
    backgroundColor: "#623528",
    borderRadius: 8,
    marginTop: 8,
  },

  errorText: {
    color: "#B00020",
    marginBottom: 8,
  },

  successText: {
    color: "#2E7D32",
    fontWeight: "600",
    marginBottom: 8,
  },
});