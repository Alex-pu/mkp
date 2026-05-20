import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import LoadingState from '../../components/ui/LoadingState';
import MessageBanner from '../../components/ui/MessageBanner';
import { useAnalytics } from '../../hooks/useAnalytics';
import { analyticsService } from '../../services/analyticsService';
import type { AppStackParamList } from '../../navigation/types';
import type { AnalyticsTextResponse } from '../../types';
import { formatDate } from '../../utils/formatDate';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<AppStackParamList, 'Analytics'>;

const AnalyticsScreen = ({ route }: Props) => {
  const { pollId } = route.params;
  const { analytics, loading, error } = useAnalytics(pollId);
  const [openTextResponses, setOpenTextResponses] = useState<Record<string, AnalyticsTextResponse[]>>({});

  useEffect(() => {
    if (!analytics) {
      return;
    }

    analytics.questions
      .filter((question) => question.type === 'OPEN_TEXT' && question.openTextResponseCount > 0)
      .forEach(async (question) => {
        try {
          const result = await analyticsService.getQuestionOpenTextResponses(pollId, question.id, { page: 1, limit: 5 });
          setOpenTextResponses((current) => ({ ...current, [question.id]: result.items }));
        } catch {
          setOpenTextResponses((current) => ({ ...current, [question.id]: [] }));
        }
      });
  }, [analytics, pollId]);

  if (loading) {
    return <LoadingState label="Loading analytics..." />;
  }

  if (error || !analytics) {
    return (
      <Screen title="Analytics unavailable">
        <MessageBanner message={error || 'Analytics could not be loaded.'} tone="error" />
      </Screen>
    );
  }

  return (
    <Screen title={analytics.pollTitle} subtitle={analytics.pollDescription || 'Lifetime analytics for this poll.'}>
      <Card>
        <Text style={styles.metric}>Votes: {analytics.totalVotes}</Text>
        <Text style={styles.metric}>Responses: {analytics.totalResponses}</Text>
        <Text style={styles.metric}>Visibility: {analytics.isPublic ? 'Public' : 'Private'}</Text>
        <Text style={styles.metric}>Last updated: {formatDate(analytics.lastUpdatedAt)}</Text>
      </Card>

      {analytics.questions.map((question) => (
        <Card key={question.id}>
          <Text style={styles.questionTitle}>{question.text}</Text>
          <Text style={styles.questionMeta}>{question.totalResponses} total responses</Text>
          {question.responses.map((response, index) => (
            <View key={`${question.id}-${index}`} style={styles.responseRow}>
              <Text style={styles.responseLabel}>{response.optionText || response.openText || 'Response'}</Text>
              <Text style={styles.responseValue}>{response.count} • {response.percentage}%</Text>
            </View>
          ))}
          {question.type === 'OPEN_TEXT' && openTextResponses[question.id]?.length ? (
            <View style={styles.examples}>
              <Text style={styles.examplesTitle}>Recent open-text answers</Text>
              {openTextResponses[question.id].map((item) => (
                <Text key={item.id} style={styles.exampleItem}>• {item.text}</Text>
              ))}
            </View>
          ) : null}
        </Card>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  metric: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  questionMeta: {
    fontSize: 13,
    color: colors.textMuted,
  },
  responseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  responseLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  responseValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  examples: {
    gap: 8,
    marginTop: 8,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  exampleItem: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
});

export default AnalyticsScreen;