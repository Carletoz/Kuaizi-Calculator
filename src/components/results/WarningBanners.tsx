import { useCalculator } from '@/state/context';
import { Banner } from '@/components/ui/Banner';

export function WarningBanners() {
  const { result } = useCalculator();

  if (result.warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      {result.warnings.map((warning, idx) => (
        <Banner key={`${warning.kind}-${idx}`} kind="warning" message={warning.message} />
      ))}
    </div>
  );
}
