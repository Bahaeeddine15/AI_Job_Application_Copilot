import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

export default function AnalyseResumeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analyze Resume Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#623528",
    fontSize: 24,
    fontWeight: "600",
  },
});