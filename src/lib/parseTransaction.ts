import { categories } from './categories';

export interface ParsedTransaction {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description?: string;
}

const incomeKeywords = [
  'gaji', 'salary', 'bonus', 'terima', 'dapat', 'income', 'pemasukan',
  'transfer masuk', 'cashback', 'refund', 'jual', 'bayaran', 'fee', 'honor'
];

const expenseKeywords = [
  'beli', 'bayar', 'habis', 'keluar', 'spend', 'pengeluaran', 'buat',
  'untuk', 'ongkos', 'biaya', 'harga', 'tagihan', 'cicilan', 'kredit'
];

const categoryPatterns: Record<string, string[]> = {
  'Makanan & Minuman': ['kopi', 'makan', 'lunch', 'dinner', 'breakfast', 'snack', 'minum', 'resto', 'cafe', 'warung', 'nasi', 'ayam', 'bakso', 'mie', 'pizza', 'burger', 'boba', 'es', 'jus', 'grab food', 'gofood', 'shopeefood'],
  'Transportasi': ['grab', 'gojek', 'taxi', 'ojek', 'bus', 'kereta', 'bensin', 'parkir', 'tol', 'transport', 'uber', 'maxim', 'indriver'],
  'Belanja': ['beli', 'belanja', 'shop', 'mall', 'toko', 'baju', 'sepatu', 'tas', 'online', 'tokped', 'shopee', 'lazada', 'blibli'],
  'Hiburan': ['nonton', 'film', 'bioskop', 'game', 'netflix', 'spotify', 'youtube', 'concert', 'wisata', 'vacation', 'liburan', 'hotel'],
  'Tagihan': ['listrik', 'pln', 'air', 'pdam', 'internet', 'wifi', 'pulsa', 'data', 'bpjs', 'asuransi', 'cicilan', 'kpr', 'kredit'],
  'Kesehatan': ['obat', 'dokter', 'rumah sakit', 'apotek', 'klinik', 'vitamin', 'medical', 'health', 'gym', 'fitness'],
  'Pendidikan': ['buku', 'kursus', 'les', 'sekolah', 'kuliah', 'udemy', 'course', 'training', 'seminar'],
  'Gaji': ['gaji', 'salary', 'upah', 'bayaran', 'honor'],
  'Bisnis': ['profit', 'keuntungan', 'omset', 'penjualan', 'client', 'project', 'invoice', 'fee'],
  'Investasi': ['dividen', 'return', 'bunga', 'deposito', 'reksadana', 'saham'],
};

// Parse amount from Indonesian text
const parseAmount = (text: string): number | null => {
  // Match patterns like: 25rb, 25ribu, 25k, 25000, Rp 25.000, 2.5jt, 2juta
  const patterns = [
    /(\d+(?:[.,]\d+)?)\s*(?:jt|juta)/i,  // 2.5jt, 2juta
    /(\d+(?:[.,]\d+)?)\s*(?:rb|ribu|k)/i, // 25rb, 25ribu, 25k
    /rp\.?\s*(\d+(?:[.,]\d{3})*(?:[.,]\d+)?)/i, // Rp 25.000 or Rp. 25,000
    /(\d+(?:[.,]\d{3})+)/,  // 25.000 or 25,000
    /(\d+)/,  // plain number
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let numStr = match[1].replace(/\./g, '').replace(/,/g, '.');
      let num = parseFloat(numStr);
      
      // Check for juta suffix
      if (/jt|juta/i.test(match[0])) {
        num *= 1000000;
      }
      // Check for ribu suffix
      else if (/rb|ribu|k/i.test(match[0])) {
        num *= 1000;
      }
      
      return Math.round(num);
    }
  }
  
  return null;
};

// Determine transaction type
const determineType = (text: string): 'income' | 'expense' => {
  const lowerText = text.toLowerCase();
  
  for (const keyword of incomeKeywords) {
    if (lowerText.includes(keyword)) {
      return 'income';
    }
  }
  
  // Default to expense for most cases
  return 'expense';
};

// Determine category
const determineCategory = (text: string, type: 'income' | 'expense'): string => {
  const lowerText = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryPatterns)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        // Make sure category matches transaction type
        const categoryObj = categories.find(c => c.name === category);
        if (categoryObj && categoryObj.type === type) {
          return category;
        }
      }
    }
  }
  
  // Default categories
  return type === 'income' ? 'Lainnya (Pemasukan)' : 'Lainnya';
};

export const parseTransaction = (text: string): ParsedTransaction | null => {
  const amount = parseAmount(text);
  
  if (!amount || amount <= 0) {
    return null;
  }

  const type = determineType(text);
  const category = determineCategory(text, type);
  
  // Extract description (clean up the original text)
  const description = text.trim();

  return {
    amount,
    type,
    category,
    description,
  };
};

// Check if text is a question rather than a transaction
export const isQuestion = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  const questionIndicators = [
    'berapa', 'apa', 'bagaimana', 'kapan', 'kenapa', 'mengapa', 'siapa',
    'gimana', 'dimana', 'tips', 'saran', 'kategori', 'pengeluaran', 'pemasukan',
    'minggu', 'bulan', 'hari', 'total', 'tren', 'analisis', 'ringkasan', 'summary',
    '?'
  ];
  
  return questionIndicators.some(indicator => lowerText.includes(indicator));
};
