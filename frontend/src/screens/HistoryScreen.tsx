import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Pressable, Platform } from "react-native";
import { ActivityIndicator, Card, Text, Button } from "react-native-paper";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import api from "../services/api";
import { getUserProfile } from "../services/AuthService";

type AnalysisItem = {
  id: number;
  resume_id: number;
  job_description: string;
  match_score: number | null;
  matched_skills: string[] | null;
  missing_skills: string[] | null;
  cover_letter: string | null;
  status: string;
  created_at: string;
};

type UserProfile = {
  first_name?: string;
  last_name?: string;
  professional_email?: string;
  phone_number?: string;
  city?: string;
  country?: string;
};

// helpers: capitalization & localization
const capitalizeName = (value?: string) => {
  if (!value?.trim()) return "";
  return value
    .trim()
    .split(/\s+/)
    .map((part) => {
      const lower = part.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
};

const localize = (_lang: string) => {
  return {
    subjectLabel: "Objet :",
    closing: "Cordialement,",
    postalPlaceholder: "Code postal + Ville",
    applicationFor: "Candidature pour le poste",
  };
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

// build HTML using parsed cover letter JSON when available
const buildCoverLetterHtml = (item: AnalysisItem, profile: UserProfile | null) => {
  let parsed: { subject?: string; body?: string; language?: string } | null = null;
  const raw = item.cover_letter || "";
  try {
    const maybe = JSON.parse(raw);
    if (maybe && typeof maybe === "object" && (maybe.subject || maybe.body || maybe.language)) {
      parsed = maybe;
    }
  } catch {
    parsed = null;
  }

  const lang = (parsed?.language || "fr").toLowerCase().startsWith("fr") ? "fr" : "fr";
  const loc = localize(lang);

  const firstName = capitalizeName(profile?.first_name);
  const lastName = capitalizeName(profile?.last_name);
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "[Votre nom complet]";

  const streetAddress = "[Votre adresse]";
  const postalCodeCity = profile?.city ? profile.city : loc.postalPlaceholder;
  const email = profile?.professional_email || "[Votre adresse e-mail]";
  const phone = profile?.phone_number || "[Votre numéro de téléphone]";

  const companyName = "[Nom de l'entreprise]";
  const hiringManagerName = "[Employeur / Nom du recruteur]";
  const hiringManagerPosition = "[Poste du recruteur]";
  const companyAddress = "[Adresse de l'entreprise]";

  const subject = parsed?.subject ? parsed.subject.trim() : `${loc.applicationFor} ${"[Intitulé du poste]"}`;

  let bodyText = parsed?.body ? parsed.body.trim() : raw.trim();
  if (!bodyText) bodyText = "[Le corps de la lettre n'est pas disponible]";

  const paragraphs = bodyText
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #222; line-height: 1.5; font-size: 14px; }
          .block { margin-bottom: 16px; }
          .subject { margin: 16px 0; font-weight: 700; }
          .body { text-align: justify; }
          .paragraph { margin: 0 0 12px 0; }
          .closing { margin-top: 16px; }
          .signature { margin-top: 12px; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="block">
          <div>${escapeHtml(fullName)}</div>
          <div>${escapeHtml(streetAddress)}</div>
          <div>${escapeHtml(postalCodeCity)}</div>
          <div>${escapeHtml(email)}</div>
          <div>${escapeHtml(phone)}</div>
        </div>

        <div class="block">
          <div>${escapeHtml(companyName)}</div>
          <div>${escapeHtml(hiringManagerName)}</div>
          <div>${escapeHtml(hiringManagerPosition)}</div>
          <div>${escapeHtml(companyAddress)}</div>
        </div>

        <div class="subject">
          ${escapeHtml(loc.subjectLabel)} ${escapeHtml(subject)}
        </div>

        <div class="body">
          ${paragraphs.map((p) => `<p class="paragraph">${escapeHtml(p)}</p>`).join("")}
        </div>

        <div class="closing">${escapeHtml(loc.closing)}</div>
        <div class="signature">${escapeHtml(fullName)}</div>
      </body>
    </html>
  `;
};

export default function HistoryScreen() {
  const [items, setItems] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const limit = 10;

  const loadHistory = async (nextPage = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/api/analysis/history", {
        params: { page: nextPage, limit },
      });

      const data = response.data?.data;
      const newItems = data?.items ?? [];

      setPage(data?.page ?? nextPage);
      setPages(data?.pages ?? 1);

      setItems((prev) => (append ? [...prev, ...newItems] : newItems));
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Failed to load history.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadHistory(1, false);
  }, []);

  const loadMore = () => {
    if (page < pages && !loadingMore) {
      loadHistory(page + 1, true);
    }
  };

  const downloadCoverLetterPdf = async (item: AnalysisItem) => {
    if (!item.cover_letter?.trim()) return;

    try {
      setDownloadingId(item.id);

      const html = buildCoverLetterHtml(item, profile);
      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Download cover letter PDF",
        });
      } else {
        setError("Sharing is not available on this device.");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to generate PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data || null);
      } catch {
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating size="large" color="#623528" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={Platform.OS === "web" ? styles.webPage : styles.mobilePage}>
      <Text style={styles.title}>Analysis History</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={items.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={<Text style={styles.empty}>No analyses yet.</Text>}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Analysis #{item.id}</Text>
              <Text style={styles.meta}>Status: {item.status}</Text>
              <Text style={styles.meta}>
                Match score: {item.match_score !== null ? `${Math.round(item.match_score * 100)}%` : "N/A"}
              </Text>
              <Text style={styles.meta}>
                Date: {item.created_at ? new Date(item.created_at).toLocaleString() : "N/A"}
              </Text>

              <Text style={styles.section}>Job Description</Text>
              <Text style={styles.body}>{item.job_description}</Text>

              <Text style={styles.section}>Matched Skills</Text>
              <Text style={styles.body}>
                {item.matched_skills?.length ? item.matched_skills.join(", ") : "None"}
              </Text>

              <Text style={styles.section}>Missing Skills</Text>
              <Text style={styles.body}>
                {item.missing_skills?.length ? item.missing_skills.join(", ") : "None"}
              </Text>

              <Button
                mode="contained"
                style={styles.downloadButton}
                buttonColor="#623528"
                textColor="#F5EDE3"
                onPress={() => downloadCoverLetterPdf(item)}
                disabled={!item.cover_letter || downloadingId === item.id || profileLoading}
              >
                {downloadingId === item.id ? "Preparing PDF..." : "Download Cover Letter PDF"}
              </Button>
            </Card.Content>
          </Card>
        )}
        ListFooterComponent={
          page < pages ? (
            <Pressable onPress={loadMore} style={styles.loadMore}>
              <Text style={styles.loadMoreText}>
                {loadingMore ? "Loading..." : "Load more"}
              </Text>
            </Pressable>
          ) : null
        }
      />
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
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5EDE3",
  },
  title: {
    color: "#623528",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  cardTitle: {
    color: "#623528",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  meta: {
    color: "#6B4A3E",
    marginBottom: 4,
  },
  section: {
    color: "#623528",
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 4,
  },
  body: {
    color: "#343434",
    lineHeight: 20,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  empty: {
    textAlign: "center",
    color: "#6B4A3E",
  },
  error: {
    color: "#B00020",
    textAlign: "center",
  },
  downloadButton: {
    marginTop: 16,
  },
  loadMore: {
    paddingVertical: 16,
    alignItems: "center",
  },
  loadMoreText: {
    color: "#623528",
    fontWeight: "600",
  },
});