import { getMessages } from 'next-intl/server';
import ClientApp from './ClientApp';

interface PageProps {
  params: { locale: string };
}

export default async function Page({ params }: PageProps) {
  // If `params` is a Promise, unwrap it first
  const resolvedParams = await params; // <-- unwrap if needed
  const locale = resolvedParams.locale || 'en';

  const messages = await getMessages({ locale });

  return <ClientApp locale={locale} messages={messages} />;
}
