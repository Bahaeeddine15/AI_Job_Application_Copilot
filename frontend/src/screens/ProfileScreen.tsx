import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Card, Text } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { getUserProfile } from "../services/AuthService";

type UserProfile = {
  first_name?: string;
  last_name?: string;
  email?: string;
  professional_email?: string;
  phone_number?: string;
  linkedin_url?: string;
  country?: string;
  city?: string;
};

const ProfileRow = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: string;
}) => (
  <View style={styles.row}>
    <View style={styles.iconBox}>
      <MaterialCommunityIcons name={icon} size={22} color="#623528" />
    </View>

    <View style={styles.rowText}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "Not provided"}</Text>
    </View>
  </View>
);

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      setProfile(data || null);
    } catch (error) {
      console.log("Load profile error:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const fullName = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();

  return (
    <View style={Platform.OS === "web" ? styles.webPage : styles.mobilePage}>
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>
            View your personal and professional information.
          </Text>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#623528" />
              <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
          ) : (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.avatar}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={42}
                    color="#623528"
                  />
                </View>

                <Text style={styles.name}>{fullName || "User"}</Text>
                <Text style={styles.email}>{profile?.email || "No email"}</Text>

                <View style={styles.divider} />

                <ProfileRow
                  icon="email-outline"
                  label="Account email"
                  value={profile?.email}
                />

                <ProfileRow
                  icon="briefcase-outline"
                  label="Professional email"
                  value={profile?.professional_email}
                />

                <ProfileRow
                  icon="phone-outline"
                  label="Phone number"
                  value={profile?.phone_number}
                />

                <ProfileRow
                  icon="linkedin"
                  label="LinkedIn"
                  value={profile?.linkedin_url}
                />

                <ProfileRow
                  icon="map-marker-outline"
                  label="Location"
                  value={[profile?.city, profile?.country].filter(Boolean).join(", ")}
                />
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  webPage: {
    height: "100vh" as any,
    overflowY: "auto" as any,
    backgroundColor: "#F5EDE3",
    paddingBottom: 80,
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
    padding: 24,
    paddingBottom: 140,
    flexGrow: 1,
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
  loadingBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#D9A883",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#956643",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9A883",
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#F0E0CE",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 14,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#343434",
    textAlign: "center",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#956643",
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#D9A883",
    marginVertical: 22,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F0E0CE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  rowText: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: "#A98062",
    fontWeight: "700",
    marginBottom: 3,
  },
  value: {
    fontSize: 15,
    color: "#343434",
    lineHeight: 22,
  },
});