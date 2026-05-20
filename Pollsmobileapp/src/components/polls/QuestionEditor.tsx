import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CreateOptionInput } from '../../types';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { colors } from '../../theme/colors';

export interface EditableQuestion {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'OPEN_TEXT';
  options: CreateOptionInput[];
}

interface QuestionEditorProps {
  index: number;
  question: EditableQuestion;
  readOnly?: boolean;
  onChange: (question: EditableQuestion) => void;
  onRemove: () => void;
}

const QuestionEditor = ({ index, question, readOnly, onChange, onRemove }: QuestionEditorProps) => {
  const setOptionText = (optionIndex: number, value: string) => {
    onChange({
      ...question,
      options: question.options.map((option, currentIndex) => currentIndex === optionIndex ? { ...option, text: value } : option),
    });
  };

  const addOption = () => {
    onChange({
      ...question,
      options: [
        ...question.options,
        { id: `draft-option-${Date.now()}`, text: '', order: question.options.length },
      ],
    });
  };

  const removeOption = (optionIndex: number) => {
    onChange({
      ...question,
      options: question.options
        .filter((_, currentIndex) => currentIndex !== optionIndex)
        .map((option, currentIndex) => ({ ...option, order: currentIndex })),
    });
  };

  const switchType = (type: 'MULTIPLE_CHOICE' | 'OPEN_TEXT') => {
    onChange({
      ...question,
      type,
      options: type === 'MULTIPLE_CHOICE'
        ? (question.options.length > 0 ? question.options : [
          { id: `draft-option-${Date.now()}`, text: '', order: 0 },
          { id: `draft-option-${Date.now() + 1}`, text: '', order: 1 },
        ])
        : [],
    });
  };

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>Question {index + 1}</Text>
        {!readOnly ? <Button label="Remove" onPress={onRemove} variant="danger" /> : null}
      </View>

      <Input
        label="Question text"
        value={question.text}
        onChangeText={(text) => onChange({ ...question, text })}
        editable={!readOnly}
        placeholder="Ask a clear question"
      />

      <View style={styles.typeRow}>
        <Pressable
          disabled={readOnly}
          onPress={() => switchType('MULTIPLE_CHOICE')}
          style={[styles.typeButton, question.type === 'MULTIPLE_CHOICE' && styles.activeType]}
        >
          <Text style={[styles.typeLabel, question.type === 'MULTIPLE_CHOICE' && styles.activeTypeLabel]}>Multiple choice</Text>
        </Pressable>
        <Pressable
          disabled={readOnly}
          onPress={() => switchType('OPEN_TEXT')}
          style={[styles.typeButton, question.type === 'OPEN_TEXT' && styles.activeType]}
        >
          <Text style={[styles.typeLabel, question.type === 'OPEN_TEXT' && styles.activeTypeLabel]}>Open text</Text>
        </Pressable>
      </View>

      {question.type === 'MULTIPLE_CHOICE' ? (
        <View style={styles.optionsWrapper}>
          <Text style={styles.sectionLabel}>Options</Text>
          {question.options.map((option, optionIndex) => (
            <View key={option.id || `${question.id}-${optionIndex}`} style={styles.optionRow}>
              <View style={styles.optionInput}>
                <Input
                  label={`Option ${optionIndex + 1}`}
                  value={option.text}
                  onChangeText={(value) => setOptionText(optionIndex, value)}
                  editable={!readOnly}
                  placeholder="Option label"
                />
              </View>
              {!readOnly ? <Button label="Delete" onPress={() => removeOption(optionIndex)} variant="secondary" /> : null}
            </View>
          ))}
          {!readOnly ? <Button label="Add option" onPress={addOption} variant="secondary" /> : null}
        </View>
      ) : (
        <Text style={styles.hint}>Users will answer this question with free-form text.</Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeType: {
    backgroundColor: colors.primarySoft,
    borderColor: '#93c5fd',
  },
  typeLabel: {
    color: colors.text,
    fontWeight: '600',
  },
  activeTypeLabel: {
    color: colors.primary,
  },
  optionsWrapper: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  optionRow: {
    gap: 10,
  },
  optionInput: {
    flex: 1,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
});

export default QuestionEditor;