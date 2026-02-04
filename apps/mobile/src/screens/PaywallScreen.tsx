import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius } from '../theme';
import { useEntitlements } from '../context/EntitlementsContext';

type PlanType = 'monthly' | 'yearly';

type Plan = {
  id: PlanType;
  name: string;
  price: string;
  period: string;
  savings?: string;
  popular?: boolean;
};

const PLANS: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$1.99',
    period: '/month'
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '$9.99',
    period: '/year',
    savings: 'Save 58%',
    popular: true
  }
];

const PRO_FEATURES = [
  {
    icon: '♾️',
    title: 'Unlimited Watchlist',
    description: 'Save as many titles as you want'
  },
  {
    icon: '🔔',
    title: 'Drop Alerts',
    description: 'Get notified when your shows release'
  },
  {
    icon: '📺',
    title: 'Filter by Your Services',
    description: 'Only see content on platforms you have'
  },
  {
    icon: '🚫',
    title: 'No Ads',
    description: 'Enjoy an uninterrupted experience'
  }
];

const PaywallScreen = () => {
  const navigation = useNavigation();
  const { restorePurchases } = useEntitlements();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [restoring, setRestoring] = useState(false);

  const handleSubscribe = () => {
    Alert.alert(
      'Coming Soon',
      'In-app purchases will be available in the next update. For now, use the dev toggle in Settings to test Pro features.',
      [{ text: 'OK' }]
    );
  };

  const handleRestore = async () => {
    setRestoring(true);
    const success = await restorePurchases();
    setRestoring(false);
    
    if (success) {
      Alert.alert('Restored!', 'Your purchases have been restored.');
      navigation.goBack();
    } else {
      Alert.alert('No Purchases Found', 'We couldn\'t find any previous purchases to restore.');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.badge}>PRO</Text>
        <Text style={styles.title}>Unlock Full Access</Text>
        <Text style={styles.subtitle}>
          Get the most out of Buzzreel with unlimited features
        </Text>
      </View>

      <View style={styles.featuresSection}>
        {PRO_FEATURES.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.plansSection}>
        {PLANS.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlan === plan.id && styles.planCardSelected,
              plan.popular && styles.planCardPopular
            ]}
            onPress={() => setSelectedPlan(plan.id)}
            activeOpacity={0.8}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>BEST VALUE</Text>
              </View>
            )}
            <View style={styles.planContent}>
              <View style={styles.planLeft}>
                <View style={[
                  styles.radio,
                  selectedPlan === plan.id && styles.radioSelected
                ]}>
                  {selectedPlan === plan.id && <View style={styles.radioDot} />}
                </View>
                <View>
                  <Text style={styles.planName}>{plan.name}</Text>
                  {plan.savings && (
                    <Text style={styles.savingsText}>{plan.savings}</Text>
                  )}
                </View>
              </View>
              <View style={styles.planRight}>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planPeriod}>{plan.period}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.subscribeButton}
        onPress={handleSubscribe}
        activeOpacity={0.9}
      >
        <Text style={styles.subscribeText}>Subscribe Now</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.restoreButton}
        onPress={handleRestore}
        disabled={restoring}
        activeOpacity={0.7}
      >
        <Text style={styles.restoreText}>
          {restoring ? 'Restoring...' : 'Restore Purchases'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.legalText}>
        Payment will be charged to your Apple/Google account. Subscription automatically renews unless canceled at least 24 hours before the end of the current period.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    padding: spacing.lg,
    paddingBottom: 40
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl
  },
  badge: {
    backgroundColor: colors.accent,
    color: colors.background,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
    overflow: 'hidden'
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22
  },
  featuresSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm
  },
  featureIcon: {
    fontSize: 24,
    marginRight: spacing.md,
    width: 32
  },
  featureContent: {
    flex: 1
  },
  featureTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2
  },
  featureDescription: {
    color: colors.textSecondary,
    fontSize: 13
  },
  plansSection: {
    marginBottom: spacing.lg
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border
  },
  planCardSelected: {
    borderColor: colors.accent
  },
  planCardPopular: {
    paddingTop: spacing.xl
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.accent,
    paddingVertical: 4,
    borderTopLeftRadius: borderRadius.lg - 2,
    borderTopRightRadius: borderRadius.lg - 2
  },
  popularText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center'
  },
  planContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.textMuted,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center'
  },
  radioSelected: {
    borderColor: colors.accent
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent
  },
  planName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600'
  },
  savingsText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2
  },
  planRight: {
    alignItems: 'flex-end'
  },
  planPrice: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700'
  },
  planPeriod: {
    color: colors.textMuted,
    fontSize: 12
  },
  subscribeButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: spacing.md
  },
  subscribeText: {
    color: colors.background,
    fontSize: 17,
    fontWeight: '700'
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm
  },
  restoreText: {
    color: colors.textSecondary,
    fontSize: 14
  },
  legalText: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: spacing.md
  }
});

export default PaywallScreen;
