import type { Labels, Locale, Part } from '../engine/types'
const short: Readonly<Record<string,Labels>> = {
  'arr-body':{en:'Body cells',ua:'Корпусні панелі'},
  'arr-deploy-m':{en:'Medium wings',ua:'Середні крила'},
  'arr-deploy-l':{en:'Large wings',ua:'Великі крила'},
  'arr-deploy-xl':{en:'XL wings',ua:'Надвеликі крила'},
  'bat-s':{en:'Small pack',ua:'Малий блок'},'bat-m':{en:'Medium pack',ua:'Середній блок'},'bat-l':{en:'Large pack',ua:'Великий блок'},
  'rf-uhf':{en:'UHF whip',ua:'UHF-штир'},'rf-s':{en:'S-band dish',ua:'S-антена'},'rf-x':{en:'X-band dish',ua:'X-антена'},
  'pl-thermal':{en:'LWIR camera',ua:'LWIR-камера'},
  'pl-visible-8':{en:'Visible 8 mm',ua:'Видима 8 мм'},'pl-visible-35':{en:'Visible 35 mm',ua:'Видима 35 мм'},'pl-visible-70':{en:'Visible 70 mm',ua:'Видима 70 мм'},
  'pl-relay':{en:'Receive / store',ua:'Приймання / пам’ять'},
  'pl-thermal-survey':{en:'Wide LWIR',ua:'Ширококутний LWIR'},'pl-visible-strip':{en:'Wide visible',ua:'Широкосмугова видима'},
  'gs-single':{en:'Single station',ua:'Одна станція'},'gs-network':{en:'Station network',ua:'Мережа станцій'},'gs-service':{en:'Frequent service',ua:'Частий сервіс'},
  'orb-sso-low':{en:'500 km SSO',ua:'SSO 500 км'},'lv-heavy':{en:'50 kg rideshare',ua:'Rideshare 50 кг'},
}
export function partShortName(part:Pick<Part,'id'|'label'>,locale:Locale):string {return short[part.id]?.[locale] ?? part.label[locale]}
