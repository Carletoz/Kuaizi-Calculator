import '@/styles/index.css';
import { Header } from '@/components/App/Header';
import { ClienteView } from '@/components/ClienteView';

export default function App() {
  return (
    <div className="min-h-screen bg-kuaizi-paper">
      <Header />
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-2">
        <ClienteView />
      </main>
    </div>
  );
}
