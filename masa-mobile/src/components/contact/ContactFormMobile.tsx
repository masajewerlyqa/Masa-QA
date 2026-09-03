import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { MasaButton } from '../MasaButton';
import { sitePostJson } from '../../api/siteApi';
import { theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';

const SUBJECTS_EN = [
  'General inquiry',
  'Order support',
  'Seller partnership',
  'Technical issue',
  'Other',
] as const;

const SUBJECTS_AR = [
  'استفسار عام',
  'دعم الطلبات',
  'شراكة بائع',
  'مشكلة تقنية',
  'أخرى',
] as const;

export function ContactFormMobile(): React.JSX.Element {
  const { isArabic, language } = useSettings();
  const subjects = isArabic ? SUBJECTS_AR : SUBJECTS_EN;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState<string>(subjects[0]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (): Promise<void> => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert(
        isArabic ? 'حقول مطلوبة' : 'Required fields',
        isArabic ? 'يرجى تعبئة جميع الحقول المطلوبة.' : 'Please fill in all required fields.',
      );
      return;
    }
    setLoading(true);
    try {
      const res = await sitePostJson<{ ok?: boolean }>('/api/contact', {
        fullName: name.trim(),
        email: email.trim(),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        subject,
        message: message.trim(),
        language,
      });
      if (!res.ok) throw new Error(res.error);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      Alert.alert(
        isArabic ? 'شكراً لك' : 'Thank you',
        isArabic ? 'استلمنا رسالتك وسنرد عليك قريباً.' : 'We received your message and will get back to you shortly.',
      );
    } catch {
      Alert.alert(
        isArabic ? 'خطأ' : 'Error',
        isArabic ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.form}>
      <Text style={[textStyle(isArabic, 'bodySm'), styles.label]}>
        {isArabic ? 'الاسم الكامل' : 'Full Name'} *
      </Text>
      <TextInput onChangeText={setName} style={styles.input} value={name} />
      <Text style={[textStyle(isArabic, 'bodySm'), styles.label]}>
        {isArabic ? 'البريد الإلكتروني' : 'Email'} *
      </Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        style={styles.input}
        value={email}
      />
      <Text style={[textStyle(isArabic, 'bodySm'), styles.label]}>
        {isArabic ? 'الهاتف' : 'Phone'}
      </Text>
      <TextInput keyboardType="phone-pad" onChangeText={setPhone} style={styles.input} value={phone} />
      <Text style={[textStyle(isArabic, 'bodySm'), styles.label]}>
        {isArabic ? 'الموضوع' : 'Subject'} *
      </Text>
      <View style={styles.subjectRow}>
        {subjects.map((s) => (
          <MasaButton
            key={s}
            label={s}
            onPress={() => setSubject(s)}
            style={styles.subjectChip}
            variant={subject === s ? 'primary' : 'outline'}
          />
        ))}
      </View>
      <Text style={[textStyle(isArabic, 'bodySm'), styles.label]}>
        {isArabic ? 'الرسالة' : 'Message'} *
      </Text>
      <TextInput
        multiline
        numberOfLines={5}
        onChangeText={setMessage}
        style={[styles.input, styles.textarea]}
        textAlignVertical="top"
        value={message}
      />
      <MasaButton
        label={loading ? (isArabic ? 'جاري الإرسال...' : 'Sending...') : isArabic ? 'إرسال' : 'Send message'}
        onPress={() => void submit()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.spacing.sm },
  label: { color: theme.colors.masaDark, marginTop: theme.spacing.xs },
  input: {
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    color: theme.colors.foreground,
    fontSize: 14,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  textarea: { minHeight: 120 },
  subjectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subjectChip: { paddingHorizontal: 10 },
});
