import '@/styles/index.css';
import { CalculatorProvider } from '@/state/context';
import { useCalculator } from '@/state/context';
import { Header } from '@/components/App/Header';
import { CalculatorForm } from '@/components/CalculatorForm';
import { ResultsPanel } from '@/components/ResultsPanel';
import { ClienteView } from '@/components/ClienteView';

function AppContent() {
  const { state } = useCalculator();

  if (state.mode === 'cliente') {
    return (
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-2">
        <ClienteView />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6 items-start">
        <CalculatorForm />
        <ResultsPanel />
      </div>
    </main>
  );
}

export default function App() {
  return (
    <CalculatorProvider>
      <div className="min-h-screen bg-kuaizi-paper">
        <Header />
        <AppContent />
      </div>
    </CalculatorProvider>
  );
}
