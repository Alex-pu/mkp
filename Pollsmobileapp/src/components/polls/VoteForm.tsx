import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Poll, ResponseInput, VoteInput } from '../../types';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import MessageBanner from '../ui/MessageBanner';
import { colors } from '../../theme/colors';

interface VoteFormProps {
  poll: Poll;
  loading?: boolean;
  submitError?: string | null;
  onSubmit: (input: VoteInput) => Promise<boolean>;
}

const VoteForm = ({ poll, loading, submitError, onSubmit }: VoteFormProps) => {
  const [responses, setResponses] = useState<Record<string, ResponseInput>>({});
  const [validationError, setValidationError] = useState('');

  const questionMap = useMemo(() => Object.fromEntries(poll.questions.map((question) => [question.id, question])), [poll.questions]);

  const isOtherOption = (questionId: string, optionId?: string) => {
    if (!optionId) {
      return false;
    }

    const question = questionMap[questionId];
    const option = question?.options.find((item) => item.id === optionId);
    return !!option && /other/i.test(option.text);
  };

  const setOption = (questionId: string, optionId: string) => {
    setResponses((current) => ({
      ...current,
      [questionId]: {
        questionId,
        optionId,
        openText: current[questionId]?.openText,
      },
    }));
  };

  const setOpenText = (questionId: string, openText: string) => {
    setResponses((current) => ({
      ...current,
      [questionId]: {
        questionId,
        optionId: current[questionId]?.optionId,
        openText,
      },
    }));
  };

  const handleSubmit = async () => {
    const payload = poll.questions.map((question) => responses[question.id]).filter(Boolean);
    const missingQuestion = poll.questions.find((question) => {
      const response = responses[question.id];

      if (question.type === 'MULTIPLE_CHOICE') {
        if (!response?.optionId) {
          return true;
        }

        return isOtherOption(question.id, response.optionId) && !response.openText?.trim();
      }

      return !response?.openText?.trim();
    });

    if (missingQuestion) {
      const response = responses[missingQuestion.id];
      const message = missingQuestion.type === 'MULTIPLE_CHOICE' && isOtherOption(missingQuestion.id, response?.optionId)
        ? `Please provide details for: ${missingQuestion.text}`
        : `Please answer: ${missingQuestion.text}`;
      setValidationError(message);
      return;
    }

    setValidationError('');
    await onSubmit({ responses: payload });
  };

  return (
    <View style={styles.wrapper}>
      {submitError ? <MessageBanner message={submitError} tone="error" /> : null}
      {validationError ? <MessageBanner message={validationError} tone="error" /> : null}

      {poll.questions.map((question, index) => (
        <Card key={question.id}>
          <Text style={styles.questionNumber}>Question {index + 1}</Text>
          <Text style={styles.questionText}>{question.text}</Text>
          {question.type === 'MULTIPLE_CHOICE' ? (
            <View style={styles.optionList}>
              {question.options.map((option) => {
                const selected = responses[question.id]?.optionId === option.id;
                return (
                  <Button
                    key={option.id}
                    label={option.text}
                    onPress={() => setOption(question.id, option.id)}
                    variant={selected ? 'primary' : 'secondary'}
                  />
                );
              })}
              {isOtherOption(question.id, responses[question.id]?.optionId) ? (
                <Input
                  label="Please specify"
                  value={responses[question.id]?.openText || ''}
                  onChangeText={(value) => setOpenText(question.id, value)}
                  placeholder="Type your answer"
                  multiline
                />
              ) : null}
            </View>
          ) : (
            <Input
              label="Your answer"
              value={responses[question.id]?.openText || ''}
              onChangeText={(value) => setOpenText(question.id, value)}
              placeholder="Type your response"
              multiline
            />
          )}
        </Card>
      ))}

      <Button label="Submit vote" onPress={handleSubmit} loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 16,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  optionList: {
    gap: 10,
  },
});

export default VoteForm;