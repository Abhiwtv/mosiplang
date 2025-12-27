import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'hi', 'de'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // only show /hi and /de in URL
});

// Matcher is correct; keeps API/static routes untouched
export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
