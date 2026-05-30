export type Incoterm = 'EXW' | 'FOB' | 'CIF';
export type FreightMode = 'SEA_FCL' | 'SEA_LCL' | 'AIR' | 'EXPRESS';
export type Currency = 'USD' | 'CNY';
export type OriginCity = 'GUANGZHOU' | 'YIWU' | 'SHANGHAI' | 'OTHER';
export type DestinationPort = 'BUENAVENTURA' | 'CARTAGENA' | 'BOGOTA' | 'MEDELLIN' | 'CALI';
export type ContainerSize = 'FCL_20' | 'FCL_40' | 'FCL_40HC';

export interface HSCategory {
  id: string;
  label: string;
  arancelRate: number;       // e.g. 0.15
  ivaRate: number;           // e.g. 0.19
  antidumpingRisk: boolean;
  invimaRequired: boolean;
  exampleHSCodes: string[];
}
