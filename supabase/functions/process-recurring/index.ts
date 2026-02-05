// @ts-nocheck - This is a Deno Edge Function, not Node.js
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date().toISOString().split('T')[0];
    console.log(`Processing recurring transactions for ${today}`);

    // Get all active recurring transactions due today or earlier
    const { data: dueTransactions, error: fetchError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('is_active', true)
      .lte('next_due_date', today);

    if (fetchError) {
      console.error('Error fetching recurring transactions:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${dueTransactions?.length || 0} due transactions`);

    const results = {
      processed: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const recurring of dueTransactions || []) {
      try {
        // Create the actual transaction
        const { error: insertError } = await supabase
          .from('transactions')
          .insert({
            user_id: recurring.user_id,
            amount: recurring.amount,
            type: recurring.type,
            category: recurring.category,
            description: recurring.description ? `${recurring.description} (otomatis)` : 'Transaksi otomatis',
            date: recurring.next_due_date,
          });

        if (insertError) {
          console.error(`Error creating transaction for ${recurring.id}:`, insertError);
          results.failed++;
          results.errors.push(`${recurring.id}: ${insertError.message}`);
          continue;
        }

        // Calculate next due date
        let nextDate = new Date(recurring.next_due_date);
        switch (recurring.frequency) {
          case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
          case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case 'yearly':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
        }

        // Update next due date
        const { error: updateError } = await supabase
          .from('recurring_transactions')
          .update({ next_due_date: nextDate.toISOString().split('T')[0] })
          .eq('id', recurring.id);

        if (updateError) {
          console.error(`Error updating next date for ${recurring.id}:`, updateError);
        }

        results.processed++;
        console.log(`Processed recurring transaction ${recurring.id}`);
      } catch (err) {
        console.error(`Error processing ${recurring.id}:`, err);
        results.failed++;
      }
    }

    console.log(`Completed: ${results.processed} processed, ${results.failed} failed`);

    return new Response(
      JSON.stringify({ success: true, ...results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-recurring:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
