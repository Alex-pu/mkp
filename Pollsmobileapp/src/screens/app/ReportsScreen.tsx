import React, { useEffect, useMemo, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import MessageBanner from '../../components/ui/MessageBanner';
import { useAuth } from '../../hooks/useAuth';
import { fbService } from '../../services/fbService';
import type { AppTabParamList } from '../../navigation/types';
import type { FbReport, FbReportSummary, PaginatedFbReportSummary, PaginationMeta } from '../../types';
import { parseLinks } from '../../utils/parseLinks';
import { formatDate } from '../../utils/formatDate';
import { colors } from '../../theme/colors';

type Props = BottomTabScreenProps<AppTabParamList, 'Reports'>;

const ReportsScreen = (_props: Props) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const [text, setText] = useState('');
  const [linksText, setLinksText] = useState('');
  const [reports, setReports] = useState<FbReport[]>([]);
  const [summary, setSummary] = useState<FbReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const normalizedFilter = filter.trim();

  const loadData = async (nextPage = page) => {
    setLoading(true);
    setError('');

    try {
      if (isSuperAdmin) {
        const result = await fbService.getSummary({ page: nextPage, limit: 4, search: normalizedFilter || undefined }) as PaginatedFbReportSummary;
        setSummary(result);
        setPagination(result.meta);
        setReports([]);
      } else {
        const result = await fbService.getMyReports({ page: nextPage, limit: 5, search: normalizedFilter || undefined, last24HoursOnly: true });
        if (!Array.isArray(result)) {
          setReports(result.items);
          setPagination(result.meta);
        }
        setSummary(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, [isSuperAdmin, normalizedFilter]);

  const adminTotals = useMemo(() => ({
    pasteCount: pagination?.summary?.pasteCount ?? reports.length,
    linkCount: pagination?.summary?.linkCount ?? reports.reduce((sum, report) => sum + report.links.length, 0),
  }), [pagination, reports]);

  const handleSubmit = async () => {
    const links = parseLinks(linksText);

    if (!text.trim()) {
      setError('Please enter the report text.');
      return;
    }

    if (links.length === 0) {
      setError('Please paste at least one link.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      await fbService.createReport({ text: text.trim(), links });
      setText('');
      setLinksText('');
      setMessage('Report submitted successfully.');
      setPage(1);
      await loadData(1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen title="Reports" subtitle={isSuperAdmin ? 'Review all admin FB/WhatsApp reports.' : 'Submit and review your last 24 hours of reports.'}>
      {error ? <MessageBanner message={error} tone="error" /> : null}
      {message ? <MessageBanner message={message} tone="success" /> : null}
      <Card>
        <Input label="Search" value={filter} onChangeText={setFilter} placeholder={isSuperAdmin ? 'Search admin, text, or link' : 'Search your text or links'} />
      </Card>

      {loading ? <LoadingState label="Loading reports..." /> : null}

      {!loading && isSuperAdmin && summary ? (
        <>
          <View style={styles.metricGrid}>
            <Card style={styles.metricCard}><Text style={styles.metricValue}>{summary.totalReports}</Text><Text style={styles.metricLabel}>Reports</Text></Card>
            <Card style={styles.metricCard}><Text style={styles.metricValue}>{summary.totalLinks}</Text><Text style={styles.metricLabel}>Links</Text></Card>
            <Card style={styles.metricCard}><Text style={styles.metricValue}>{summary.adminsWithReports}</Text><Text style={styles.metricLabel}>Admins</Text></Card>
          </View>
          {summary.items.length === 0 ? <EmptyState title="No reports found" description="Try a different filter or wait for new reports." /> : null}
          {summary.items.map((item) => (
            <Card key={item.adminId}>
              <Text style={styles.cardTitle}>{item.adminName || item.adminEmail}</Text>
              <Text style={styles.cardSubtitle}>{item.adminEmail}</Text>
              <Text style={styles.cardSubtitle}>{item.pasteCount} pastes • {item.linkCount} links</Text>
              {item.reports.map((report) => (
                <View key={report.id} style={styles.reportBlock}>
                  <Text style={styles.reportDate}>{formatDate(report.createdAt)}</Text>
                  <Text style={styles.reportText}>{report.text}</Text>
                  {report.links.map((link) => (
                    <Text key={`${report.id}-${link}`} style={styles.link} onPress={() => Linking.openURL(link)}>{link}</Text>
                  ))}
                </View>
              ))}
            </Card>
          ))}
        </>
      ) : null}

      {!loading && !isSuperAdmin ? (
        <>
          <View style={styles.metricGrid}>
            <Card style={styles.metricCard}><Text style={styles.metricValue}>{adminTotals.pasteCount}</Text><Text style={styles.metricLabel}>Your pastes</Text></Card>
            <Card style={styles.metricCard}><Text style={styles.metricValue}>{adminTotals.linkCount}</Text><Text style={styles.metricLabel}>Your links</Text></Card>
          </View>
          <Card>
            <Text style={styles.cardTitle}>Submit report</Text>
            <Input label="Report text" value={text} onChangeText={setText} multiline placeholder="Write what was posted or shared..." />
            <Input label="Links" value={linksText} onChangeText={setLinksText} multiline placeholder={'https://facebook.com/...\nhttps://chat.whatsapp.com/...'} />
            <Button label="Submit report" onPress={handleSubmit} loading={submitting} />
          </Card>
          {reports.length === 0 ? <EmptyState title="No recent reports" description="Your last 24 hours of reports will appear here." /> : null}
          {reports.map((report) => (
            <Card key={report.id}>
              <Text style={styles.reportDate}>{formatDate(report.createdAt)}</Text>
              <Text style={styles.reportText}>{report.text}</Text>
              {report.links.map((link) => (
                <Text key={`${report.id}-${link}`} style={styles.link} onPress={() => Linking.openURL(link)}>{link}</Text>
              ))}
            </Card>
          ))}
        </>
      ) : null}

      {!loading ? (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button label="Previous" onPress={() => { const nextPage = Math.max(1, (pagination?.page ?? page) - 1); setPage(nextPage); loadData(nextPage); }} disabled={(pagination?.page ?? 1) <= 1} variant="secondary" style={{ flex: 1 }} />
          <Button label={`Page ${pagination?.page ?? 1}/${pagination?.totalPages ?? 1}`} onPress={() => {}} disabled variant="secondary" style={{ flex: 1 }} />
          <Button label="Next" onPress={() => { const nextPage = Math.min(pagination?.totalPages ?? 1, (pagination?.page ?? page) + 1); setPage(nextPage); loadData(nextPage); }} disabled={(pagination?.page ?? 1) >= (pagination?.totalPages ?? 1)} variant="secondary" style={{ flex: 1 }} />
        </View>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  metricGrid: {
    gap: 12,
  },
  metricCard: {
    gap: 4,
  },
  metricValue: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
  },
  metricLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  reportBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    gap: 8,
  },
  reportDate: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  reportText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  link: {
    fontSize: 13,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});

export default ReportsScreen;