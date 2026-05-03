import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { ActivityIndicator, Card, Text, Button } from "react-native-paper";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import api from "../services/api";

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

      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 32px;
                color: #222;
                line-height: 1.6;
              }
              h1 {
                color: #623528;
                font-size: 24px;
                margin-bottom: 16px;
              }
              .meta {
                margin-bottom: 24px;
                font-size: 12px;
                color: #666;
              }
              .content {
                white-space: pre-wrap;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <h1>Cover Letter</h1>
            <div class="meta">
              Analysis #${item.id} | ${new Date(item.created_at).toLocaleString()}
            </div>
            <div class="content">${item.cover_letter.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>")}</div>
          </body>
        </html>
      `;

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
    <View style={styles.container}>
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
                disabled={!item.cover_letter || downloadingId === item.id}
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