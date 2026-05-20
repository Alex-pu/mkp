import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AssignableAdmin, Poll } from '../../types';
import Card from '../ui/Card';
import Input from '../ui/Input';
import ToggleRow from '../ui/ToggleRow';
import Button from '../ui/Button';
import MessageBanner from '../ui/MessageBanner';
import QuestionEditor, { type EditableQuestion } from './QuestionEditor';
import { colors } from '../../theme/colors';

export interface PollFormValues {
  title: string;
  description: string;
  isActive: boolean;
  isPublic: boolean;
  assignedAdminIds: string[];
  questions: EditableQuestion[];
}

interface PollFormProps {
  initialPoll?: Poll | null;
  submitLabel: string;
  loading?: boolean;
  error?: string;
  readOnly?: boolean;
  readOnlyMessage?: string;
  allowStatusEditWhenReadOnly?: boolean;
  assignableAdmins?: AssignableAdmin[];
  allowPrivateAssignments?: boolean;
  onSubmit: (values: PollFormValues) => Promise<void> | void;
}

const buildInitialQuestions = (poll?: Poll | null): EditableQuestion[] => {
  if (!poll) {
    return [{
      id: `draft-question-${Date.now()}`,
      text: '',
      type: 'MULTIPLE_CHOICE',
      options: [
        { id: `draft-option-${Date.now()}`, text: '', order: 0 },
        { id: `draft-option-${Date.now() + 1}`, text: '', order: 1 },
      ],
    }];
  }

  return poll.questions.map((question) => ({
    id: question.id,
    text: question.text,
    type: question.type,
    options: question.options.map((option) => ({ id: option.id, text: option.text, order: option.order })),
  }));
};

const PollForm = ({
  initialPoll,
  submitLabel,
  loading,
  error,
  readOnly,
  readOnlyMessage,
  allowStatusEditWhenReadOnly,
  assignableAdmins = [],
  allowPrivateAssignments,
  onSubmit,
}: PollFormProps) => {
  const [values, setValues] = useState<PollFormValues>({
    title: initialPoll?.title || '',
    description: initialPoll?.description || '',
    isActive: initialPoll?.isActive ?? true,
    isPublic: initialPoll?.isPublic ?? true,
    assignedAdminIds: initialPoll?.assignedAdmins.map((admin) => admin.id) || [],
    questions: buildInitialQuestions(initialPoll),
  });

  useEffect(() => {
    setValues({
      title: initialPoll?.title || '',
      description: initialPoll?.description || '',
      isActive: initialPoll?.isActive ?? true,
      isPublic: initialPoll?.isPublic ?? true,
      assignedAdminIds: initialPoll?.assignedAdmins.map((admin) => admin.id) || [],
      questions: buildInitialQuestions(initialPoll),
    });
  }, [initialPoll]);

  const fieldsLocked = !!readOnly;
  const onlyStatusEditable = readOnly && allowStatusEditWhenReadOnly;

  const canEditGeneralFields = !fieldsLocked;
  const canEditStatus = !readOnly || !!allowStatusEditWhenReadOnly;

  const updateQuestion = (index: number, question: EditableQuestion) => {
    setValues((current) => ({
      ...current,
      questions: current.questions.map((item, currentIndex) => currentIndex === index ? question : item),
    }));
  };

  const addQuestion = () => {
    setValues((current) => ({
      ...current,
      questions: [
        ...current.questions,
        {
          id: `draft-question-${Date.now()}`,
          text: '',
          type: 'MULTIPLE_CHOICE',
          options: [
            { id: `draft-option-${Date.now()}`, text: '', order: 0 },
            { id: `draft-option-${Date.now() + 1}`, text: '', order: 1 },
          ],
        },
      ],
    }));
  };

  const removeQuestion = (index: number) => {
    setValues((current) => ({
      ...current,
      questions: current.questions.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const toggleAdmin = (adminId: string) => {
    setValues((current) => ({
      ...current,
      assignedAdminIds: current.assignedAdminIds.includes(adminId)
        ? current.assignedAdminIds.filter((id) => id !== adminId)
        : [...current.assignedAdminIds, adminId],
    }));
  };

  const handleSubmit = async () => {
    await onSubmit({
      ...values,
      questions: values.questions.map((question, questionIndex) => ({
        ...question,
        options: question.options.map((option, optionIndex) => ({ ...option, order: optionIndex })),
        order: questionIndex,
      })) as EditableQuestion[],
    });
  };

  return (
    <View style={styles.wrapper}>
      {error ? <MessageBanner message={error} tone="error" /> : null}
      {readOnlyMessage ? <MessageBanner message={readOnlyMessage} tone="info" /> : null}

      <Card>
        <Input
          label="Title"
          value={values.title}
          onChangeText={(title) => setValues((current) => ({ ...current, title }))}
          editable={canEditGeneralFields}
          placeholder="Poll title"
        />
        <Input
          label="Description"
          value={values.description}
          onChangeText={(description) => setValues((current) => ({ ...current, description }))}
          editable={canEditGeneralFields}
          multiline
          placeholder="What is this poll about?"
        />
        <ToggleRow
          label="Poll is active"
          description="Controls whether the poll is open for responses."
          value={values.isActive}
          onValueChange={(isActive) => setValues((current) => ({ ...current, isActive }))}
          disabled={!canEditStatus}
        />
        <ToggleRow
          label="Public poll"
          description="Public polls can be opened directly from the public listing."
          value={values.isPublic}
          onValueChange={(isPublic) => setValues((current) => ({ ...current, isPublic, assignedAdminIds: isPublic ? [] : current.assignedAdminIds }))}
          disabled={!canEditGeneralFields}
        />
      </Card>

      {allowPrivateAssignments && !values.isPublic ? (
        <Card>
          <Text style={styles.sectionTitle}>Assign admins</Text>
          <Text style={styles.sectionHint}>These admins can access and vote on this private poll.</Text>
          {assignableAdmins.length === 0 ? <Text style={styles.sectionHint}>No admin accounts available.</Text> : null}
          {assignableAdmins.map((admin) => {
            const selected = values.assignedAdminIds.includes(admin.id);
            return (
              <View key={admin.id} style={styles.assignmentRow}>
                <View style={styles.assignmentCopy}>
                  <Text style={styles.assignmentTitle}>{admin.name || admin.email}</Text>
                  <Text style={styles.assignmentHint}>{admin.email}</Text>
                </View>
                <Button
                  label={selected ? 'Remove' : 'Assign'}
                  onPress={() => toggleAdmin(admin.id)}
                  variant={selected ? 'secondary' : 'primary'}
                  disabled={!canEditGeneralFields}
                />
              </View>
            );
          })}
        </Card>
      ) : null}

      {!onlyStatusEditable ? (
        <View style={styles.questionsSection}>
          <Text style={styles.sectionTitle}>Questions</Text>
          {values.questions.map((question, index) => (
            <QuestionEditor
              key={question.id}
              index={index}
              question={question}
              readOnly={!canEditGeneralFields}
              onChange={(nextQuestion) => updateQuestion(index, nextQuestion)}
              onRemove={() => removeQuestion(index)}
            />
          ))}
          {canEditGeneralFields ? <Button label="Add question" onPress={addQuestion} variant="secondary" /> : null}
        </View>
      ) : null}

      <Button label={submitLabel} onPress={handleSubmit} loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  sectionHint: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  assignmentRow: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 12,
  },
  assignmentCopy: {
    gap: 4,
  },
  assignmentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  assignmentHint: {
    fontSize: 13,
    color: colors.textMuted,
  },
  questionsSection: {
    gap: 12,
  },
});

export default PollForm;