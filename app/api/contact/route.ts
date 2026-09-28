import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { sendContactInquiryNotificationEmail } from '@/lib/email';
import { ContactMessage } from '@/lib/types';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache'
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    // Validate inputs
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please enter your full name (minimum 2 characters).' }, 
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' }, 
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'Please enter a message (at least 5 characters).' }, 
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const newMessage: ContactMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name: name.trim(),
      email: email.trim(),
      phone: (phone || '').trim(),
      subject: (subject || 'General Tournament Query').trim(),
      message: message.trim(),
      status: 'UNREAD',
      created_at: new Date().toISOString()
    };

    // Pre-sync existing messages from Supabase backup if this serverless lambda is fresh
    if (isSupabaseConfigured) {
      try {
        const supabase = getServiceSupabase();
        if (supabase) {
          const { data: backupData } = await supabase
            .from('site_settings')
            .select('value')
            .eq('key', 'contact_messages_backup')
            .single();
          if (backupData?.value && Array.isArray(backupData.value)) {
            backupData.value.forEach((m: any) => dataStore.saveContactMessage(m));
          }
        }
      } catch (e) {
        console.warn('Pre-sync contact backup error:', e);
      }
    }

    // 1. Store in memory
    const saved = dataStore.saveContactMessage(newMessage);

    // 2. Persist to Supabase
    if (isSupabaseConfigured) {
      try {
        const supabase = getServiceSupabase();
        if (supabase) {
          // Attempt table insert
          await supabase.from('contact_messages').insert({
            id: saved.id,
            name: saved.name,
            email: saved.email,
            phone: saved.phone,
            subject: saved.subject,
            message: saved.message,
            status: saved.status,
            created_at: saved.created_at
          });

          // Backup in site_settings so even without table migrations it persists 100% reliably
          await supabase.from('site_settings').upsert({
            key: 'contact_messages_backup',
            value: dataStore.getContactMessages(),
            description: 'Backup of user transmitted contact inquiries',
            updated_at: new Date().toISOString()
          }, { onConflict: 'key' });
        }
      } catch (dbErr) {
        console.warn('Supabase contact message persist error:', dbErr);
      }
    }

    // 3. Dispatch alert email asynchronously to gamersgesports@gmail.com
    sendContactInquiryNotificationEmail(saved).catch(err => {
      console.warn('Contact email dispatch notification failed:', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Message transmitted successfully. Our battle desk will review your inquiry shortly.',
      data: { id: saved.id, status: saved.status }
    }, { headers: NO_CACHE_HEADERS });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to transmit message.' }, 
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
