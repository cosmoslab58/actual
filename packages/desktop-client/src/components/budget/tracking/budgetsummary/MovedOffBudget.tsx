import React from 'react';
import { useTranslation } from 'react-i18next';

import { styles } from '@actual-app/components/styles';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as monthUtils from '@actual-app/core/shared/months';
import { q } from '@actual-app/core/shared/query';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useFormat } from '#hooks/useFormat';
import { useQuery } from '#hooks/useQuery';

// cosmoslab: net money moved this month from on-budget accounts into off-budget
// ones (brokerage, IRA). In a tracking budget these transfers are neither income
// nor spending, so they get their own line instead of hiding.
export function MovedOffBudget({ month }: { month: string }) {
  const { t } = useTranslation();
  const format = useFormat();
  const { data } = useQuery<number>(
    () =>
      q('transactions')
        .filter({
          'account.offbudget': false,
          'payee.transfer_acct.offbudget': true,
          is_parent: false,
          // two clauses: one object holding both $gte and $lte keeps only one
          $and: [
            { date: { $gte: monthUtils.firstDayOfMonth(month) } },
            { date: { $lte: monthUtils.lastDayOfMonth(month) } },
          ],
        })
        .calculate({ $sum: '$amount' }),
    [month],
  );
  const moved = -((data as unknown as number | null) ?? 0);
  if (!moved) {
    return null;
  }

  return (
    <View
      // 30 = the 20px pie plus its 10px gap on the Income/Expenses rows above
      style={{ lineHeight: 1.5, fontSize: 14, marginLeft: 30, ...styles.tnum }}
      title={t(
        'Transfers to off-budget accounts this month. Not counted as income or spending.',
      )}
    >
      <Text style={{ color: theme.pageTextLight }}>
        {t('Moved off budget')}
      </Text>
      <PrivacyFilter>
        <FinancialText>{format(moved, 'financial')}</FinancialText>
      </PrivacyFilter>
    </View>
  );
}
