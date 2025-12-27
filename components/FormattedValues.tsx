'use client';

import { useLocale } from 'next-intl';
import { formatMoney, formatNumber, formatDate } from '@/lib/formatCurrency';

interface FormattedMoneyProps {
  amount: number;
  currency?: string;
}

export function FormattedMoney({ amount, currency }: FormattedMoneyProps) {
  const locale = useLocale();
  return <span className="tabular-nums">{formatMoney(amount, locale, currency)}</span>;
}

interface FormattedNumberProps {
  value: number;
}

export function FormattedNumber({ value }: FormattedNumberProps) {
  const locale = useLocale();
  return <span className="tabular-nums">{formatNumber(value, locale)}</span>;
}

interface FormattedDateProps {
  date: Date | string;
}

export function FormattedDate({ date }: FormattedDateProps) {
  const locale = useLocale();
  return <span>{formatDate(date, locale)}</span>;
}