import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Poll } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { colors } from '../../theme/colors';
import { formatDate } from '../../utils/formatDate';

interface PollCardProps {
  poll: Poll;
  onPress?: () => void;
  actionLabel?: string;
}

const PollCard = ({ poll, onPress, actionLabel }: PollCardProps) => (
  <Card>
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text style={styles.title}>{poll.title}</Text>
        {poll.description ? <Text style={styles.description}>{poll.description}</Text> : null}
      </View>
      <View style={styles.badges}>
        <Badge label={poll.isPublic ? 'Public' : 'Private'} tone="info" />
        <Badge label={poll.isActive ? 'Active' : 'Inactive'} tone={poll.isActive ? 'success' : 'danger'} />
      </View>
    </View>

    <View style={styles.stats}>
      <Text style={styles.statText}>{poll.questions.length} questions</Text>
      <Text style={styles.statText}>{poll.totalVotes} votes</Text>
      <Text style={styles.statText}>Updated {formatDate(poll.updatedAt)}</Text>
    </View>

    {actionLabel && onPress ? (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
        <Text style={styles.actionText}>{actionLabel}</Text>
      </Pressable>
    ) : null}
  </Card>
);

const styles = StyleSheet.create({
  header: {
    gap: 12,
  },
  headerCopy: {
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stats: {
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  action: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  pressed: {
    opacity: 0.85,
  },
});

export default PollCard;