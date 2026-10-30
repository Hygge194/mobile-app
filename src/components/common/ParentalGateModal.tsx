import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../stores/useAppStore';
import { UI_COLORS } from '../../constants/colors';

export const ParentalGateModal: React.FC = () => {
  const { parentalGateOpen, setParentalGateOpen, setMode } = useAppStore();

  const [num1, setNum1] = useState(7);
  const [num2, setNum2] = useState(5);
  const [options, setOptions] = useState<number[]>([]);

  useEffect(() => {
    if (parentalGateOpen) {
      generateMathProblem();
    }
  }, [parentalGateOpen]);

  const generateMathProblem = () => {
    const a = Math.floor(Math.random() * 8) + 3;
    const b = Math.floor(Math.random() * 8) + 2;
    const correct = a + b;
    setNum1(a);
    setNum2(b);

    const wrong1 = correct + (Math.random() > 0.5 ? 2 : -2);
    const wrong2 = correct + (Math.random() > 0.5 ? 3 : -3);
    const shuffled = [correct, wrong1, wrong2].sort(() => Math.random() - 0.5);
    setOptions(shuffled);
  };

  const handleSelectOption = (chosen: number) => {
    if (chosen === num1 + num2) {
      setMode('caregiver');
      setParentalGateOpen(false);
    } else {
      generateMathProblem();
    }
  };

  return (
    <Modal
      visible={parentalGateOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setParentalGateOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHeader}>
            <Ionicons name="shield-checkmark-outline" size={28} color={UI_COLORS.primary} />
            <Text style={styles.modalTitle}>Khóa Phụ huynh (Parental Gate)</Text>
          </View>

          <Text style={styles.instructionText}>
            Dành cho Phụ huynh và Giáo viên. Vui lòng giải phép tính sau để vào cài đặt:
          </Text>

          <View style={styles.mathContainer}>
            <Text style={styles.mathText}>
              {num1} + {num2} = ?
            </Text>
          </View>

          <View style={styles.optionsRow}>
            {options.map((opt, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.optionButton}
                onPress={() => handleSelectOption(opt)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setParentalGateOpen(false)}
          >
            <Text style={styles.cancelText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  modalHeader: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: UI_COLORS.textPrimary,
  },
  instructionText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  mathContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mathText: {
    fontSize: 28,
    fontWeight: '800',
    color: UI_COLORS.primary,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1.5,
    borderColor: '#70B6F6',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0369A1',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
