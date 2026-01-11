// Thai month names
export const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
] as const;

// Thai month names (short)
export const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
] as const;

// Helper function to get Thai month name (1-indexed)
export const getThaiMonth = (month: number): string => {
  const index = Math.max(0, Math.min(11, month - 1));
  return THAI_MONTHS[index] ?? THAI_MONTHS[0];
};

// Helper function to get Thai month short name (1-indexed)
export const getThaiMonthShort = (month: number): string => {
  const index = Math.max(0, Math.min(11, month - 1));
  return THAI_MONTHS_SHORT[index] ?? THAI_MONTHS_SHORT[0];
};

// Convert year to Buddhist Era (พ.ศ.)
export const toBuddhistYear = (year: number): number => {
  return year + 543;
};
