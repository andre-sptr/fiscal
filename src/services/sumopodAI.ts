// Sumopod AI Service
// API: https://ai.sumopod.com/v1/chat/completions

const SUMOPOD_API_URL = 'https://ai.sumopod.com/v1/chat/completions';
const SUMOPOD_API_KEY = import.meta.env.VITE_SUMOPOD_API_KEY;
const SUMOPOD_MODEL = 'gpt-5.1';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function chatWithSumopod(
  messages: Message[],
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  if (!SUMOPOD_API_KEY) {
    throw new Error('SUMOPOD_API_KEY is not configured');
  }

  const response = await fetch(SUMOPOD_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUMOPOD_API_KEY}`,
    },
    body: JSON.stringify({
      model: SUMOPOD_MODEL,
      messages,
      max_tokens: options?.maxTokens || 1000,
      temperature: 1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Sumopod API error:', response.status, errorText);
    throw new Error(`Sumopod API error: ${response.status}`);
  }

  const data: ChatCompletionResponse = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// Financial assistant system prompt
export const FISCAL_SYSTEM_PROMPT = `Kamu adalah Fiscal AI, asisten keuangan pribadi yang ramah dan cerdas untuk pengguna di Indonesia.

KEMAMPUAN:
1. Menganalisis dan memberikan insight tentang keuangan pengguna
2. Memberikan tips dan saran pengelolaan keuangan
3. Membantu menghitung dan merencanakan anggaran
4. Menjawab pertanyaan tentang keuangan pribadi

ATURAN:
- Selalu gunakan Bahasa Indonesia yang natural dan ramah
- Semua nilai mata uang dalam Rupiah (IDR)
- Gunakan emoji untuk membuat respons lebih menarik
- Berikan saran yang praktis dan actionable
- Jika tidak yakin, akui ketidakpastian dan minta klarifikasi

FORMAT ANGKA:
- Gunakan format Indonesia: Rp 1.000.000 (titik sebagai pemisah ribuan)
- Singkat angka besar: 1jt = 1.000.000, 1rb = 1.000`;

// Transaction parser system prompt
export const TRANSACTION_PARSER_PROMPT = `Kamu adalah parser transaksi keuangan untuk aplikasi Fiscal.

TUGAS:
Ekstrak detail transaksi dari input pengguna (teks atau deskripsi).

ATURAN:
1. Semua jumlah dalam Rupiah (IDR)
2. Parse slang Indonesia: "rb" = ribu (ribuan), "jt" = juta (jutaan), "k" = ribu
3. Tentukan apakah income atau expense berdasarkan konteks
4. Kategorikan ke salah satu kategori berikut:
   - Expense: "Makanan & Minuman", "Transportasi", "Belanja", "Rumah & Sewa", "Utilitas & Tagihan", "Kesehatan", "Pendidikan", "Liburan", "Hadiah & Donasi", "Hiburan", "Lainnya"
   - Income: "Gaji", "Investasi", "Freelance", "Bisnis", "Lainnya (Pemasukan)"

SELALU respons dengan JSON valid dalam format ini:
{
  "success": true,
  "transaction": {
    "amount": <number dalam IDR>,
    "type": "income" | "expense",
    "category": "<nama kategori>",
    "description": "<deskripsi singkat>"
  },
  "message": "<pesan konfirmasi ramah dalam Bahasa Indonesia>"
}

Jika tidak bisa parsing, respons dengan:
{
  "success": false,
  "message": "<respons membantu dalam Bahasa Indonesia>"
}

CONTOH:
- "Beli kopi 25rb" → amount: 25000, type: expense, category: "Makanan & Minuman"
- "Gaji bulan ini 5jt" → amount: 5000000, type: income, category: "Gaji"
- "Isi bensin 100k" → amount: 100000, type: expense, category: "Transportasi"`;

// Chat function for Fiscal AI assistant
export async function askFiscalAI(
  userMessage: string,
  context?: {
    totalBalance?: number;
    monthlyIncome?: number;
    monthlyExpense?: number;
    recentTransactions?: Array<{
      amount: number;
      type: string;
      category: string;
      date: string;
    }>;
  }
): Promise<string> {
  let contextInfo = '';

  if (context) {
    contextInfo = `\n\nKONTEKS KEUANGAN PENGGUNA:
- Total Saldo: Rp ${context.totalBalance?.toLocaleString('id-ID') || 0}
- Pemasukan Bulan Ini: Rp ${context.monthlyIncome?.toLocaleString('id-ID') || 0}
- Pengeluaran Bulan Ini: Rp ${context.monthlyExpense?.toLocaleString('id-ID') || 0}
${context.recentTransactions?.length ? `- Transaksi Terakhir: ${context.recentTransactions.slice(0, 5).map(t => `${t.type === 'income' ? '+' : '-'}Rp${t.amount.toLocaleString('id-ID')} (${t.category})`).join(', ')}` : ''}`;
  }

  const messages: Message[] = [
    { role: 'system', content: FISCAL_SYSTEM_PROMPT + contextInfo },
    { role: 'user', content: userMessage }
  ];

  return chatWithSumopod(messages);
}

// Parse transaction from text
export async function parseTransaction(text: string): Promise<{
  success: boolean;
  transaction?: {
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description: string;
  };
  message: string;
}> {
  const messages: Message[] = [
    { role: 'system', content: TRANSACTION_PARSER_PROMPT },
    { role: 'user', content: `Parse transaksi ini: "${text}"` }
  ];

  const response = await chatWithSumopod(messages);

  try {
    // Extract JSON from response
    const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) ||
      response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return {
      success: false,
      message: response || 'Maaf, tidak dapat memproses input. Coba format lain.'
    };
  }
}

// Parse receipt image using multimodal (vision)
export async function parseReceiptImage(base64Image: string): Promise<{
  success: boolean;
  transaction?: {
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description: string;
  };
  message: string;
}> {
  if (!SUMOPOD_API_KEY) {
    throw new Error('SUMOPOD_API_KEY is not configured');
  }

  const systemPrompt = `Kamu adalah parser struk/receipt untuk aplikasi keuangan Fiscal.

TUGAS:
Analisis gambar struk belanja dan ekstrak informasi transaksi.

ATURAN:
1. Cari total amount/jumlah yang harus dibayar
2. Semua jumlah dalam Rupiah (IDR)
3. Identifikasi merchant/toko dari struk
4. Kategorikan ke salah satu kategori berikut:
   - "Makanan & Minuman", "Transportasi", "Belanja", "Rumah & Sewa", "Utilitas & Tagihan", "Kesehatan", "Pendidikan", "Liburan", "Hadiah & Donasi", "Hiburan", "Lainnya"

SELALU respons dengan JSON valid dalam format ini:
{
  "success": true,
  "transaction": {
    "amount": <number dalam IDR>,
    "type": "expense",
    "category": "<nama kategori>",
    "description": "<nama toko/merchant - item utama>"
  },
  "message": "<konfirmasi dalam Bahasa Indonesia>"
}

Jika tidak bisa membaca struk:
{
  "success": false,
  "message": "Maaf, tidak dapat membaca struk. Pastikan foto jelas dan coba lagi."
}`;

  try {
    const response = await fetch(SUMOPOD_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUMOPOD_API_KEY}`,
      },
      body: JSON.stringify({
        model: SUMOPOD_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analisis struk belanja ini dan ekstrak informasi transaksi.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        temperature: 1,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sumopod API error:', response.status, errorText);

      // Check if multimodal is not supported
      if (response.status === 400 && errorText.includes('image')) {
        return {
          success: false,
          message: 'Model gpt-5.1 tidak mendukung gambar. Silakan ketik manual transaksi Anda.'
        };
      }

      throw new Error(`Sumopod API error: ${response.status}`);
    }

    const data: ChatCompletionResponse = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';

    // Parse JSON from response
    const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) ||
      aiResponse.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to parse receipt:', error);
    return {
      success: false,
      message: 'Gagal memproses struk. Silakan ketik manual transaksi Anda.'
    };
  }
}
