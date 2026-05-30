import '@/styles/index.css';
import { CalculatorProvider } from '@/state/context';
import { Header } from '@/components/App/Header';
import { CalculatorForm } from '@/components/CalculatorForm';
import { ResultsPanel } from '@/components/ResultsPanel';

export default function App() {
  return (
    <CalculatorProvider>
      <div className="min-h-screen bg-kuaizi-paper">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6 items-start">
            {/* Left: Form */}
            <CalculatorForm />

            {/* Right: Results (sticky on desktop) */}
            <ResultsPanel />
          </div>
        </main>
      </div>
    </CalculatorProvider>
  );
}
