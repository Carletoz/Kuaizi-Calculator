import { useSession } from '@/state/session/SessionProvider';
import { SupplierStep } from './steps/SupplierStep';
import { ProductStep } from './steps/ProductStep';
import { ReviewStep } from './steps/ReviewStep';

export function QuoteWizard() {
  const { state } = useSession();

  return (
    <div className="min-h-screen bg-kuaizi-paper">
      {state.step === 'supplier' && <SupplierStep />}
      {state.step === 'product' && <ProductStep />}
      {state.step === 'review' && <ReviewStep />}
    </div>
  );
}
