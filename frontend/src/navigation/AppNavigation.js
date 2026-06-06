import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Menu, IconButton, Text } from "react-native-paper";
import HistoryScreen from "../screens/HistoryScreen";
import SettingsScreen from "../screens/ProfileScreen";
import AnalyseResumeScreen from "../screens/AnalyseResumeScreen";
import UploadResumeScreen from "../screens/UploadResumeScreen";
import JobDescriptionScreen from "../screens/JobDescriptionScreen";
import ResultsScreen from "../screens/ResultsScreen";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import DownloadResumeScreen from "../screens/DownloadResumeScreen";
import ProfileScreen from "../screens/ProfileScreen";

import { getUserProfile, logout } from "../services/AuthService";

const Stack = createStackNavigator();

const capitalizeWord = (s) => {
  if (!s) return "";
  const t = s.toString().trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
};

const capitalizeWords = (s) => {
  if (!s) return "";
  return s
    .toString()
    .split(" ")
    .filter(Boolean)
    .map((w) => capitalizeWord(w))
    .join(" ");
};

function AppHeader({ navigation }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [userFullName, setUserFullName] = useState("There");
  const appName = capitalizeWords("ai job copilot");

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      try {
        const data = await getUserProfile();
        if (!mounted || !data) return;
        const first = capitalizeWords(data.first_name || "");
        const last = capitalizeWords(data.last_name || "");
        const full = `${first} ${last}`.trim();
        setUserFullName(full.length ? full : "There");
      } catch {
        /* ignore */
      }
    };
    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    setMenuVisible(false);
    try {
      await logout();
    } finally {
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    }
  };

  return (
    <View style={styles.header}>
      <Text style={styles.appName}>{appName}</Text>

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <View style={styles.rightIcons}>
            <IconButton
              icon="home"
              iconColor="#FFFFFF"
              size={28}
              onPress={() => navigation.navigate("Home")}
              style={styles.iconButton}
            />
            <IconButton
              icon="menu"
              iconColor="#FFFFFF"
              size={28}
              onPress={() => setMenuVisible(true)}
              style={styles.iconButton}
            />
          </View>
        }
        contentStyle={styles.menuContent}
      >
        <Menu.Item 
          onPress={() => {
            setMenuVisible(false);
            navigation.navigate("Profile");
          }}
          title={userFullName} 
          titleStyle={styles.menuName}  />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            navigation.navigate("History");
          }}
          title="History"
          titleStyle={styles.menuItem}
        />
        
        <Menu.Item onPress={handleLogout} title="Logout" titleStyle={styles.menuItem} />
      </Menu>
    </View>
  );
}

export default function AppNavigator() {
  const screenOptions = ({ navigation, route }) => ({
    header: () => {
      if (route.name === "Login" || route.name === "Register") {
        return null;
      }
      return <AppHeader navigation={navigation} />;
    },
  });

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={screenOptions}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="UploadResume" component={UploadResumeScreen} />
        <Stack.Screen name="JobDescription" component={JobDescriptionScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />

        <Stack.Screen
          name="AnalyzeResume"
          component={AnalyseResumeScreen}
          options={{ unmountOnBlur: true }}
        />
        <Stack.Screen name="DownloadResume" component={DownloadResumeScreen} />
      </Stack.Navigator>

    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#343434",
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#D9A883",
    letterSpacing: 1.2,
    textTransform: "none",
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    margin: 0,
    marginLeft: 6,
  },
  menuContent: {
    backgroundColor: "#343434",
    borderRadius: 12,
    marginTop: 4,
  },
  menuName: {
    color: "#D9A883",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  menuItem: {
    color: "#A98062",
    fontSize: 15,
  },
});