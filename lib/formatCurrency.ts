export const formatMoney = (amount: number, locale: string, currency?: string) => {
  const intlLocale = 
    locale === 'hi' ? 'en-IN' : 
    locale === 'de' ? 'de-DE' : 
    'en-US';
  
  const currencyCode = currency || (
    locale === 'de' ? 'EUR' : 
    locale === 'hi' ? 'INR' : 
    'USD'
  );
  
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (value: number, locale: string) => {
  const intlLocale = 
    locale === 'hi' ? 'en-IN' : 
    locale === 'de' ? 'de-DE' : 
    'en-US';
  
  return new Intl.NumberFormat(intlLocale).format(value);
};

export const formatDate = (date: Date | string, locale: string) => {
  const intlLocale = 
    locale === 'hi' ? 'hi-IN' : 
    locale === 'de' ? 'de-DE' : 
    'en-US';
  
  return new Intl.DateTimeFormat(intlLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};
