import '@/styles/index.css';
import { Header } from '@/components/App/Header';
import { ClienteView } from '@/components/ClienteViewV2';
import { SessionProvider } from '@/state/session/SessionProvider';
import { QuoteWizard } from '@/components/v3/QuoteWizard';

const USE_V3 = true;

export default function App() {
  if (USE_V3) {
    return (
      <SessionProvider>
        <QuoteWizard />
      </SessionProvider>
    );
  }

  return (
    <div className="min-h-screen bg-kuaizi-paper">
      <Header />
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-2">
        <ClienteView />
      </main>
    </div>
  );
}
