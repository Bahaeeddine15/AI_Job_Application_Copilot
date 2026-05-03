import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Menu, IconButton, Text } from "react-native-paper";
import HistoryScreen from "../screens/HistoryScreen";
import SettingsScreen from "../screens/SettingsScreen";
import AnalyseResumeScreen from "../screens/AnalyseResumeScreen";
import UploadResumeScreen from "../screens/UploadResumeScreen";
import JobDescriptionScreen from "../screens/JobDescriptionScreen";
import ResultsScreen from "../screens/ResultsScreen";


import HomeScreen from "../screens/HomeScreen";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

const Stack = createStackNavigator();

function AppHeader({ navigation }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const userFullName = "Nassima Ait Lfakir";

  return (
    <View style={styles.header}>
      <Text style={styles.appName}>Ai Job Copilot</Text>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <IconButton
            icon="menu"
            iconColor="#FFFFFF"
            size={28}
            onPress={() => setMenuVisible(true)}
            style={{ margin: 0 }}
          />
        }
        contentStyle={styles.menuContent}
      >
        <Menu.Item
          title={userFullName}
          titleStyle={styles.menuName}
          disabled
        />
        <Menu.Item
          onPress={() => { setMenuVisible(false); navigation.navigate("Home"); }}
          title="Home"
          titleStyle={styles.menuItem}
        />
        <Menu.Item
          onPress={() => { setMenuVisible(false); navigation.navigate("History"); }}
          title="History"
          titleStyle={styles.menuItem}
        />
        <Menu.Item
          onPress={() => { setMenuVisible(false); navigation.navigate("Settings"); }}
          title="Settings"
          titleStyle={styles.menuItem}
        />
        <Menu.Item
          onPress={() => { setMenuVisible(false); navigation.navigate("JobDescription"); }}
          title="Job Description"
          titleStyle={styles.menuItem}
        />
      </Menu>
    </View>
  );
}

export default function AppNavigator() {
  const screenOptions = ({ navigation, route }) => ({
    header: () => {
      // N'affiche le header que si on n'est pas sur Login ou Register
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
        <Stack.Screen name="AnalyzeResume" component={AnalyseResumeScreen} options={{ unmountOnBlur: true }}
        />
      </Stack.Navigator>

    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#343434", // Espresso Noir
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  appName: {
    fontSize: 22,
    fontWeight: "300",
    color: "#D9A883", // Toasty — warm accent on dark
    letterSpacing: 1.5,
    textTransform: "lowercase",
  },
  menuContent: {
    backgroundColor: "#343434",
    borderRadius: 12,
    marginTop: 4,
  },
  menuName: {
    color: "#D9A883", // Toasty
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  menuItem: {
    color: "#A98062", // Espresso Foam
    fontSize: 15,
  },
});