import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import AppNavigation from "./src/navigation/AppNavigation";

export default function App() {
  return (
    <PaperProvider>
      <AppNavigation />
    </PaperProvider>
  );
}