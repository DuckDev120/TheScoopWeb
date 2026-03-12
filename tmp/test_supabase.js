
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://igifnhouvypftjdalysv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnaWZuaG91dnlwZnRqZGFseXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjYxNjksImV4cCI6MjA4ODkwMjE2OX0.3ZtqAQfk51gn_lKMJc60Wrkw0juVhHCyjjPPtQZUYaU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing access_codes...');
  const { data: codes, error: codesError } = await supabase.from('access_codes').select('*').limit(1);
  if (codesError) {
    console.error('access_codes failed:', codesError.message);
  } else {
    console.log('access_codes success:', codes?.length, 'records found');
  }

  console.log('Testing articles...');
  const { data: articles, error: articlesError } = await supabase.from('articles').select('*').limit(1);
  if (articlesError) {
    console.error('articles failed:', articlesError.message);
  } else {
    console.log('articles success:', articles?.length, 'records found');
  }

  console.log('Testing insert into articles...');
  const { data: inserted, error: insertError } = await supabase.from('articles').insert([{
    title: 'Test Article',
    content: 'Test content',
    is_published: true
  }]).select();
  
  if (insertError) {
    console.error('insert failed:', insertError.message);
  } else {
    console.log('insert success:', inserted);
  }
}

test();
