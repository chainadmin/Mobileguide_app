import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius } from '../theme';

type PlanType = 'monthly' | 'yearly' | 'lifetime';

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
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$19.99',
    period: 'one-time',
    savings: 'Best Value'
  }
];

const PRO_FEATURES = [
  'Unlimited watchlist items',
  'Release date alerts & notifications',
  'Platform filters by streaming service',
  'Priority support',
  'No ads ever'
];

const PaywallScreen = () => {
  const navigation = useNavigation();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');

  const handleSubscribe = () => {
    console.log('Subscribe to:', selectedPlan);
  };

  const handleRestore = () => {
    console.log('Restore purchases');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.badge}>PRO</Text>
        <Text style={styles.title}>Unlock Full Access</Text>
        <Text style={styles.subtitle}>
          Get unlimited watchlist, alerts, and premium features
        </Text>
      </View>

      <View style={styles.featuresSection}>
        {PRO_FEATURES.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.featureText}>{feature}</Text>
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
                <Text style={styles.popularText}>MOST POPULAR</Text>
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
        <Text style={styles.subscribeText}>Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.restoreButton}
        onPress={handleRestore}
        activeOpacity={0.7}
      >
        <Text style={styles.restoreText}>Restore Purchases</Text>
      </TouchableOpacity>

      <Text style={styles.legalText}>
        Payment will be charged to your account. Subscription automatically renews unless canceled at least 24 hours before the end of the current period.
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
    alignItems: 'center',
    paddingVertical: spacing.sm
  },
  checkmark: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
    marginRight: spacing.md,
    width: 24
  },
  featureText: {
    color: colors.textPrimary,
    fontSize: 15,
    flex: 1
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
