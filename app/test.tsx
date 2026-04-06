import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header1, Header2, Header3, Header4, Header5 } from '@/components/header';
import ProgressBar from '@/components/progress-bar';
import TxtBox from '@/components/txt-box';

export default function TestPage() {
  const router = useRouter();
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('');
  const [v3, setV3] = useState('텍스트');
  const [v4, setV4] = useState('텍스트');
  const [v5, setV5] = useState('텍스트');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── Header ── */}
        <Text style={styles.sectionLabel}>Header</Text>
        <View style={styles.section}>
          <Header1 onPressBack={() => router.back()} hasAlarm />
          <Header2 title="Text" onPressBack={() => router.back()} />
          <Header3 title="Text" onPressBack={() => router.back()} />
          <Header4 title="Text" />
          <Header5 title="Text" rightText="Text 2" />
        </View>

        {/* ── 진행-bar ── */}
        <Text style={styles.sectionLabel}>진행-bar</Text>
        <View style={styles.section}>
          <ProgressBar value={1} max={5} />
          <ProgressBar value={2} max={5} />
          <ProgressBar value={3} max={5} />
          <ProgressBar value={4} max={5} />
          <ProgressBar value={5} max={5} />
        </View>

        {/* ── Txt-box ── */}
        <Text style={styles.sectionLabel}>Txt-box</Text>
        <View style={styles.section}>
          {/* 1. Default */}
          <TxtBox placeholder="텍스트" value={v1} onChangeText={setV1} />
          {/* 2. Focused (탭해서 확인) */}
          <TxtBox placeholder="텍스트" value={v2} onChangeText={setV2} />
          {/* 3. Focused + 값 (탭해서 확인) */}
          <TxtBox placeholder="텍스트" value={v3} onChangeText={setV3} />
          {/* 4. Unfocused + 값 */}
          <TxtBox placeholder="텍스트" value={v4} onChangeText={setV4} />
          {/* 5. 에러 (보조텍스트) */}
          <TxtBox
            placeholder="텍스트"
            value={v5}
            onChangeText={setV5}
            supportingText="보조텍스트"
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 12,
  },
  section: {
    paddingHorizontal: 20,
    gap: 14,
  },
});
