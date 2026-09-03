import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { MasaButton } from '../MasaButton';
import { sitePostJson } from '../../api/siteApi';
import { theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';

/**
 * Subject values MUST be the API's enum slugs, not display labels.
 *
 * `/api/contact` validates `subject` with `z.enum(CONTACT_SUBJECT_VALUES)`
 * (lib/contact/subjects.ts). This form previously posted human-readable labels
 * ("General inquiry", and in Arabic "استفسار عام"), so every mobile submission
 * failed validation with HTTP 400 before an email was ever sent -- which the
 * catch block then surfaced as the generic "something went wrong" alert.
 * Labels are for display only; `value` is what goes on the wire.
 */
const SUBJECTS: { value: string; en: string; ar: string }[] = [
  { value: 'customer-support', en: 'Customer Support', ar: 'دعم العملاء' },
  { value: 'seller-partnership', en: 'Seller Partnership', ar: 'شراكة البائعين' },
  { value: 'order-inquiry', en: 'Order Inquiry', ar: 'استفسار عن الطلب' },
  { value: 'technical-issue', en: 'Technical Issue', ar: 'مشكلة تقنية' },
  { value: 'business-collaboration', en: 'Business Collaboration', ar: 'تعاون تجاري' },
  { value: 'complaints-feedback', en: 'Complaints & feedback', ar: 'شكاوى وملاحظات' },
  { value: 'other', en: 'Other', ar: 'أخرى' },
];

export function ContactFormMobile(): React.JSX.Element {
  const { isArabic, language } = useSettings();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState<string>(SUBJECTS[0].value);
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
      const res = await sitePostJson<{ ok?: boolean; error?: string }>('/api/contact', {
        fullName: name.trim(),
        email: email.trim(),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        subject,
        message: message.trim(),
        language,
      });

      // The API's own message is shown rather than a generic string: it
      // distinguishes validation problems, rate limiting (429) and delivery
      // failures (503), all of which previously looked identical to the user.
      if (!res.ok) {
        Alert.alert(isArabic ? 'خطأ' : 'Error', res.error);
        return;
      }
      if (!res.data?.ok) {
        Alert.alert(
          isArabic ? 'خطأ' : 'Error',
          res.data?.error ??
            (isArabic ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'Something went wrong. Please try again.'),
        );
        return;
      }

      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      Alert.alert(
        isArabic ? 'شكراً لك' : 'Thank you',
        isArabic ? 'استلمنا رسالتك وسنرد عليك قريباً.' : 'We received your message and will get back to you shortly.',
      );
    } catch (e) {
      Alert.alert(
        isArabic ? 'خطأ' : 'Error',
        e instanceof Error
          ? e.message
          : isArabic
            ? 'حدث خطأ. يرجى المحاولة مرة أخرى.'
            : 'Something went wrong. Please try again.',
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
        {SUBJECTS.map((s) => (
          <MasaButton
            key={s.value}
            label={isArabic ? s.ar : s.en}
            onPress={() => setSubject(s.value)}
            style={styles.subjectChip}
            variant={subject === s.value ? 'primary' : 'outline'}
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
