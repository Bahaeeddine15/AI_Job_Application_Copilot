import React, { useState} from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { submitJobDescription } from "../services/JobDescriptionService";


export default function JobDescriptionScreen() {
  const [jobDescription, setJobDescription] = useState("");
  const [saving, setSaving] = useState(false);

  

  const handleSubmit = async () => {
    if (!jobDescription.trim()) {
        console.log("No text to submit");
        return;
      }
    
      try {
        setSaving(true);
    
        const data = await submitJobDescription(jobDescription);
        
    
        console.log("Save success:", data);
      } catch (error) {
        console.log("Save error:", error);
      } finally {
        setSaving(false);
      }
  };
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
        <ScrollView
                
                showsVerticalScrollIndicator={false}
        >
            <View style={styles.content}>
                <Text style={styles.title}>Upload Job Description</Text>
                <Text style={styles.subtitle}>
                Paste the full text of the job description you want to apply for.
                </Text>

                <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.cardTitle}>Job Description</Text>
                    <Text style={styles.cardText}>
                    This will help us analyze the key requirements and tailor your application.
                    </Text>
                    <View style={styles.textEditorContainer}> 
                      <TextInput
                      style={styles.textEditor}
                      placeholder="Paste the job description here..."
                      placeholderTextColor="#A98062"
                      outlineColor="#D9A883"
                      activeOutlineColor="#623528"
                      textColor="#343434"
                      multiline
                      textAlignVertical="top"
                      value={jobDescription}
                      onChangeText={setJobDescription}
                      />
                    </View>
                    
                    <Button
                    mode="contained"
                    style={styles.button}
                    textColor="#D9A883"
                    onPress={handleSubmit}>
                    {saving ? "Submitting..." : "Submit Job Description"}
                   
                    </Button>
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
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#956643",
    lineHeight: 22,
    marginBottom: 18,
  },
  button: {
    backgroundColor: "#623528",
    borderRadius: 8,
      marginTop: 12,
    
  },
   textEditorContainer: {
    marginTop: 18,
    marginBottom: 18,
  },
  textEditor: {
  minHeight: 220,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: "#D9A883",
  borderRadius: 12,
  padding: 14,
  color: "#050404",
  fontSize: 14,
  lineHeight: 22,
  marginTop: 18,
  marginBottom: 18,
},
  

});