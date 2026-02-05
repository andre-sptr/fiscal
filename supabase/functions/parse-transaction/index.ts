// @ts-nocheck - This is a Deno Edge Function, not Node.js
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParseRequest {
  type: 'text' | 'image';
  content: string; // text message or base64 image
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUMOPOD_API_KEY = Deno.env.get('SUMOPOD_API_KEY');
    if (!SUMOPOD_API_KEY) {
      console.error('SUMOPOD_API_KEY is not configured');
      throw new Error('AI service not configured');
    }

    const { type, content }: ParseRequest = await req.json();
    console.log(`Processing ${type} request`);

    const systemPrompt = `You are a financial transaction parser for an Indonesian finance app called Fiscal.

Your task is to extract transaction details from user input (text or receipt images).

RULES:
1. All amounts should be in Indonesian Rupiah (IDR)
2. Parse Indonesian slang for amounts: "rb" = ribu (thousand), "jt" = juta (million), "k" = thousand
3. Determine if it's income or expense based on context
4. Categorize into one of these categories:
   - Expense: "Makanan & Minuman", "Transportasi", "Belanja", "Rumah & Sewa", "Utilitas & Tagihan", "Kesehatan", "Pendidikan", "Liburan", "Hadiah & Donasi", "Hiburan", "Lainnya"
   - Income: "Gaji", "Investasi", "Freelance", "Bisnis", "Lainnya (Pemasukan)"

ALWAYS respond with valid JSON in this exact format:
{
  "success": true,
  "transaction": {
    "amount": <number in IDR>,
    "type": "income" | "expense",
    "category": "<category name>",
    "description": "<brief description>"
  },
  "message": "<friendly confirmation message in Indonesian>"
}

If you cannot parse a transaction, respond with:
{
  "success": false,
  "message": "<helpful response in Indonesian>"
}

Examples:
- "Beli kopi 25rb" → amount: 25000, type: expense, category: "Makanan & Minuman"
- "Gaji bulan ini 5jt" → amount: 5000000, type: income, category: "Gaji"
- "Isi bensin 100k" → amount: 100000, type: expense, category: "Transportasi"`;

    let messages: any[] = [
      { role: "system", content: systemPrompt }
    ];

    if (type === 'image') {
      // For receipt images, use multimodal
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: "Please analyze this receipt image and extract the transaction details. Look for the total amount, merchant name, and what was purchased."
          },
          {
            type: "image_url",
            image_url: {
              url: content.startsWith('data:') ? content : `data:image/jpeg;base64,${content}`
            }
          }
        ]
      });
    } else {
      // For text input
      messages.push({
        role: "user",
        content: `Parse this transaction: "${content}"`
      });
    }

    console.log('Calling Sumopod AI...');

    const response = await fetch('https://ai.sumopod.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUMOPOD_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5.1',
        messages,
        // gpt-5.1 only supports temperature=1
        temperature: 1,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, message: 'Terlalu banyak permintaan. Coba lagi nanti.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, message: 'Kuota AI habis. Hubungi administrator.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    console.log('AI Response:', aiResponse);

    // Parse JSON from AI response
    let result;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) ||
        aiResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
      result = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      result = {
        success: false,
        message: aiResponse || 'Maaf, tidak dapat memproses input. Coba format lain.'
      };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in parse-transaction:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Terjadi kesalahan. Silakan coba lagi.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
