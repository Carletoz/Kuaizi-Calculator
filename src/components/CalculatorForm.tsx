import { useCalculator } from '@/state/context';
import { visibility } from '@/lib/validation/visibility';
import { SectionA_Product } from './sections/SectionA_Product';
import { SectionB_China } from './sections/SectionB_China';
import { SectionC_Freight } from './sections/SectionC_Freight';
import { SectionD_Insurance } from './sections/SectionD_Insurance';
import { SectionE_Customs } from './sections/SectionE_Customs';
import { SectionF_Local } from './sections/SectionF_Local';
import { SectionG_Financial } from './sections/SectionG_Financial';
import { SectionH_Kuaizi } from './sections/SectionH_Kuaizi';
import { SectionKuaiziDDP } from './sections/SectionKuaiziDDP';

export function CalculatorForm() {
  const { state } = useCalculator();

  const showSectionC = visibility.sectionC(state);
  const showSectionD = visibility.sectionDInsurance(state);
  const showSectionE = visibility.sectionECustoms(state);
  const showKuaiziDdp = visibility.sectionKuaiziDdp(state);

  return (
    <div className="calculator-form space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
        <SectionA_Product />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
        <SectionB_China />
      </div>

      {showSectionC && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
          <SectionC_Freight />
        </div>
      )}

      {showSectionD && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
          <SectionD_Insurance />
        </div>
      )}

      {showSectionE && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
          <SectionE_Customs />
        </div>
      )}

      {showKuaiziDdp && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
          <SectionKuaiziDDP />
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
        <SectionF_Local />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4">
        <SectionG_Financial />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-4 overflow-hidden">
        <SectionH_Kuaizi />
      </div>
    </div>
  );
}
