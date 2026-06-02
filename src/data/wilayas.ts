export interface Wilaya {
  id: number;
  nameFr: string;
  nameAr: string;
}

export const WILAYAS: Wilaya[] = [
  { id: 1, nameFr: "Adrar", nameAr: "أدرار" },
  { id: 2, nameFr: "Chlef", nameAr: "الشلف" },
  { id: 3, nameFr: "Laghouat", nameAr: "الأغواط" },
  { id: 4, nameFr: "Oum El Bouaghi", nameAr: "أم البواقي" },
  { id: 5, nameFr: "Batna", nameAr: "باتنة" },
  { id: 6, nameFr: "Béjaïa", nameAr: "بجاية" },
  { id: 7, nameFr: "Biskra", nameAr: "بسكرة" },
  { id: 8, nameFr: "Béchar", nameAr: "بشار" },
  { id: 9, nameFr: "Blida", nameAr: "البليدة" },
  { id: 10, nameFr: "Bouira", nameAr: "البويرة" },
  { id: 11, nameFr: "Tamanrasset", nameAr: "تمنراست" },
  { id: 12, nameFr: "Tébessa", nameAr: "تبسة" },
  { id: 13, nameFr: "Tlemcen", nameAr: "تلمسان" },
  { id: 14, nameFr: "Tiaret", nameAr: "تيارت" },
  { id: 15, nameFr: "Tizi Ouzou", nameAr: "تيزي وزو" },
  { id: 16, nameFr: "Alger", nameAr: "الجزائر العاصمة" },
  { id: 17, nameFr: "Djelfa", nameAr: "الجلفة" },
  { id: 18, nameFr: "Jijel", nameAr: "جيجل" },
  { id: 19, nameFr: "Sétif", nameAr: "سطيف" },
  { id: 20, nameFr: "Saïda", nameAr: "سعيدة" },
  { id: 21, nameFr: "Skikda", nameAr: "سكيكدة" },
  { id: 22, nameFr: "Sidi Bel Abbès", nameAr: "سيدي بلعباس" },
  { id: 23, nameFr: "Annaba", nameAr: "عنابة" },
  { id: 24, nameFr: "Guelma", nameAr: "قالمة" },
  { id: 25, nameFr: "Constantine", nameAr: "قسنطينة" },
  { id: 26, nameFr: "Médéa", nameAr: "المدية" },
  { id: 27, nameFr: "Mostaganem", nameAr: "مستغانم" },
  { id: 28, nameFr: "M'Sila", nameAr: "المسيلة" },
  { id: 29, nameFr: "Mascara", nameAr: "معسكر" },
  { id: 30, nameFr: "Ouargla", nameAr: "ورقلة" },
  { id: 31, nameFr: "Oran", nameAr: "وهران" },
  { id: 32, nameFr: "El Bayadh", nameAr: "البيض" },
  { id: 33, nameFr: "Illizi", nameAr: "إليزي" },
  { id: 34, nameFr: "Bordj Bou Arréridj", nameAr: "برج بوعريريج" },
  { id: 35, nameFr: "Boumerdès", nameAr: "بومرداس" },
  { id: 36, nameFr: "El Tarf", nameAr: "الطارف" },
  { id: 37, nameFr: "Tindouf", nameAr: "تندوف" },
  { id: 38, nameFr: "Tissemsilt", nameAr: "تيسمسيلت" },
  { id: 39, nameFr: "El Oued", nameAr: "الوادي" },
  { id: 40, nameFr: "Khenchela", nameAr: "خنشلة" },
  { id: 41, nameFr: "Souk Ahras", nameAr: "سوق أهراس" },
  { id: 42, nameFr: "Tipaza", nameAr: "تيبازة" },
  { id: 43, nameFr: "Mila", nameAr: "ميلة" },
  { id: 44, nameFr: "Aïn Defla", nameAr: "عين الدفلة" },
  { id: 45, nameFr: "Naâma", nameAr: "النعامة" },
  { id: 46, nameFr: "Aïn Témouchent", nameAr: "عين تموشنت" },
  { id: 47, nameFr: "Ghardaïa", nameAr: "غرداية" },
  { id: 48, nameFr: "Relizane", nameAr: "غليزان" },
  { id: 49, nameFr: "El M'Ghair", nameAr: "المغير" },
  { id: 50, nameFr: "El Meniaa", nameAr: "المنيعة" },
  { id: 51, nameFr: "Ouled Djellal", nameAr: "أولاد جلال" },
  { id: 52, nameFr: "Bordj Baji Mokhtar", nameAr: "برج باجي مختار" },
  { id: 53, nameFr: "Beni Abbes", nameAr: "بني عباس" },
  { id: 54, nameFr: "Timimoun", nameAr: "تيميمون" },
  { id: 55, nameFr: "Touggourt", nameAr: "توقرت" },
  { id: 56, nameFr: "Djanet", nameAr: "جانت" },
  { id: 57, nameFr: "In Salah", nameAr: "عين صالح" },
  { id: 58, nameFr: "In Guezzam", nameAr: "عين قزام" }
];

// Remote/southern wilayas which naturally cost more for shipping companies
export const SOUTHERN_WILAYAS = [1, 8, 11, 30, 33, 37, 47, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58];

export function getShippingFee(wilayaId: number, deliveryType: 'house' | 'office'): number {
  const isSouth = SOUTHERN_WILAYAS.includes(wilayaId);
  if (deliveryType === 'office') {
    return isSouth ? 750 : 400;
  } else {
    return isSouth ? 1100 : 700;
  }
}
