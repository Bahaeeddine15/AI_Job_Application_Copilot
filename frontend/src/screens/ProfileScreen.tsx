import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Button,
  Card,
  Text,
  TextInput,
} from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { getUserProfile, updateUserProfile } from "../services/AuthService";

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

type ProfileForm = {
  professional_email: string;
  phone_number: string;
  linkedin_url: string;
  country: string;
  city: string;
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

  const [form, setForm] = useState<ProfileForm>({
    professional_email: "",
    phone_number: "",
    linkedin_url: "",
    country: "",
    city: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const fillForm = (data: UserProfile | null) => {
    setForm({
      professional_email: data?.professional_email || "",
      phone_number: data?.phone_number || "",
      linkedin_url: data?.linkedin_url || "",
      country: data?.country || "",
      city: data?.city || "",
    });
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data = await getUserProfile();

      setProfile(data || null);
      fillForm(data || null);
    } catch (error) {
      console.log("Load profile error:", error);
      setProfile(null);
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = () => {
    fillForm(profile);
    setError("");
    setSuccess("");
    setEditMode(true);
  };

  const handleCancel = () => {
    fillForm(profile);
    setError("");
    setSuccess("");
    setEditMode(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updatedData = await updateUserProfile({
        professional_email: form.professional_email,
        phone_number: form.phone_number,
        linkedin_url: form.linkedin_url,
        country: form.country,
        city: form.city,
      });

      const nextProfile = {
        ...(profile || {}),
        ...updatedData,
      };

      setProfile(nextProfile);
      fillForm(nextProfile);

      setEditMode(false);
      setSuccess("Profile updated successfully.");
    } catch (error: any) {
      console.log("Update profile error:", error);
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const fullName = `${profile?.first_name || ""} ${
    profile?.last_name || ""
  }`.trim();

  const location = [profile?.city, profile?.country].filter(Boolean).join(", ");

  return (
    <View style={Platform.OS === "web" ? styles.webPage : styles.mobilePage}>
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>My Profile</Text>

          <Text style={styles.subtitle}>
            View and update your personal and professional information.
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

                {editMode ? (
                  <>
                    <Text style={styles.sectionTitle}>Edit Profile</Text>

                    <TextInput
                      label="Professional email"
                      value={form.professional_email}
                      onChangeText={(value) =>
                        handleChange("professional_email", value)
                      }
                      mode="outlined"
                      style={styles.input}
                      keyboardType="email-address"
                      autoCapitalize="none"
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

                    <TextInput
                      label="Phone number"
                      value={form.phone_number}
                      onChangeText={(value) =>
                        handleChange("phone_number", value)
                      }
                      mode="outlined"
                      style={styles.input}
                      keyboardType="phone-pad"
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

                    <TextInput
                      label="LinkedIn URL"
                      value={form.linkedin_url}
                      onChangeText={(value) =>
                        handleChange("linkedin_url", value)
                      }
                      mode="outlined"
                      style={styles.input}
                      autoCapitalize="none"
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

                    <TextInput
                      label="Country"
                      value={form.country}
                      onChangeText={(value) => handleChange("country", value)}
                      mode="outlined"
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

                    <TextInput
                      label="City"
                      value={form.city}
                      onChangeText={(value) => handleChange("city", value)}
                      mode="outlined"
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

                    <Button
                      mode="contained"
                      style={styles.button}
                      textColor="#D9A883"
                      onPress={handleSave}
                      loading={saving}
                      disabled={saving}
                    >
                      Save Changes
                    </Button>

                    <Button
                      mode="text"
                      textColor="#623528"
                      onPress={handleCancel}
                      disabled={saving}
                      style={styles.cancelButton}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
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
                      value={location}
                    />

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    {success ? (
                      <Text style={styles.successText}>{success}</Text>
                    ) : null}

                    <Button
                      mode="contained"
                      style={styles.button}
                      textColor="#D9A883"
                      onPress={handleEdit}
                    >
                      Edit Profile
                    </Button>
                  </>
                )}
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

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#343434",
    marginBottom: 14,
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

  input: {
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    color: "#343434",
  },

  button: {
    backgroundColor: "#623528",
    borderRadius: 8,
    marginTop: 12,
  },

  cancelButton: {
    marginTop: 6,
  },

  errorText: {
    color: "#B00020",
    marginTop: 8,
    marginBottom: 8,
  },

  successText: {
    color: "#2E7D32",
    marginTop: 8,
    marginBottom: 8,
    fontWeight: "600",
  },
});