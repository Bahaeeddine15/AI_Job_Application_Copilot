// wizardStyles.ts
import { StyleSheet } from "react-native";

export const inputAppearance = {
  textColor: "#2B1A12",
  outlineColor: "#B27C5A",
  activeOutlineColor: "#623528",
  theme: {
    colors: {
      onSurfaceVariant: "#7D5A45", // placeholder plus foncé
      primary: "#623528",
      outline: "#B27C5A",
    },
  },
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5EDE3",
  },
  content: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#343434",
  },
  subtitle: {
    fontSize: 15,
    color: "#956643",
    lineHeight: 22,
  },
  stepRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  stepItem: {
    alignItems: "center",
    flex: 1,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#D9A883",
    opacity: 0.35,
    marginBottom: 6,
  },
  stepDotActive: {
    opacity: 1,
    backgroundColor: "#623528",
  },
  stepLabel: {
    fontSize: 11,
    color: "#623528",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D9A883",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#343434",
    marginBottom: 12,
  },
  input: {
    marginBottom: 10,
    backgroundColor: "#FFFDFB",
  },
  textArea: {
    marginBottom: 10,
    backgroundColor: "#FFFDFB",
    minHeight: 100,
  },
  block: {
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 8,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 10,
    borderColor: "#623528",
    borderWidth: 2,
    backgroundColor: "#F0DFD2", // plus visible
  },
  secondaryButtonLabel: {
    color: "#3A1E14",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  errorText: {
    color: "#B00020",
    marginTop: 6,
    marginBottom: 2,
    fontSize: 13,
    fontWeight: "500",
  },
  successText: {
    color: "#1E6D3A",
    marginTop: 6,
    marginBottom: 2,
    fontSize: 13,
    fontWeight: "600",
  },
});