import React, { useMemo, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Button, Text, TextInput } from "react-native-paper";
import { inputAppearance, styles as wizardStyles } from "./wizardStyles";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

export default function DatePickerField({ label, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(parseDate(value));
  const [webDate, setWebDate] = useState<string>(value || formatDate(new Date()));

  const currentDate = useMemo(() => parseDate(value), [value]);

  const openPicker = () => {
    setTempDate(currentDate);
    setWebDate(value || formatDate(new Date()));
    setOpen(true);
  };

  const closePicker = () => setOpen(false);

  const onNativeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "dismissed") return;
    if (!selectedDate) return;

    if (Platform.OS === "android") {
      onChange(formatDate(selectedDate));
      setOpen(false);
      return;
    }

    setTempDate(selectedDate);
  };

  const confirm = () => {
    if (Platform.OS === "web") {
      onChange(webDate);
    } else {
      onChange(formatDate(tempDate));
    }
    setOpen(false);
  };

  const WebInput: any = "input";

  return (
    <View>
      <Pressable onPress={openPicker}>
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label={label}
            value={value}
            editable={false}
            style={wizardStyles.input}
            right={<TextInput.Icon icon="calendar" />}
            {...inputAppearance}
          />
        </View>
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={closePicker}>
        <View style={localStyles.backdrop}>
          <View style={localStyles.card}>
            <Text style={localStyles.title}>Select date</Text>

            {Platform.OS === "web" ? (
                <WebInput
                    type="date"
                    value={webDate}
                    onChange={(e: any) => setWebDate(e.target.value)}
                    style={{
                    width: "100%",
                    height: 42,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#B27C5A",
                    padding: 10,
                    color: "#2B1A12",
                    backgroundColor: "#FFFDFB",
                    colorScheme: "light",
                    WebkitTextFillColor: "#2B1A12",
                    } as any}
                />
                ) : (
                <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onNativeChange}
                    themeVariant="light"
                    textColor="#2B1A12"
                    accentColor="#623528"
                />
                )}

            {Platform.OS !== "android" ? (
              <View style={localStyles.actions}>
                <Button mode="text" onPress={closePicker}>
                  Cancel
                </Button>
                <Button mode="contained" onPress={confirm}>
                  Confirm
                </Button>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const localStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#343434",
  },
  actions: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  
});