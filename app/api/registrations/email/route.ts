import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';
import { sendRegistrationConfirmationEmail } from '@/lib/email';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const { registrationId } = await req.json();

    if (!registrationId) {
      return NextResponse.json({ success: false, error: 'Registration ID is required.' }, { status: 400 });
    }

    let registration: any = null;

    if (isSupabaseConfigured) {
      const supabase = getServiceSupabase();
      if (supabase) {
        const { data } = await supabase
          .from('registrations')
          .select('*, events(title)')
          .eq('id', registrationId)
          .single();
        if (data) {
          registration = {
            ...data,
            event_title: data.events?.title || 'Gamers Guild Championship'
          };
        }
      }
    }

    if (!registration) {
      registration = dataStore.getRegistrations().find(r => r.id === registrationId);
    }

    if (!registration) {
      return NextResponse.json({ success: false, error: 'Registration record not found.' }, { status: 404 });
    }

    // Send confirmation email keeping exact same registration code
    const emailResult = await sendRegistrationConfirmationEmail({
      to: registration.email,
      playerName: registration.player_name,
      registrationCode: registration.public_code,
      eventName: registration.event_title || 'Gamers Guild Championship',
      state: registration.state,
      teamName: registration.team_name,
      status: registration.status,
      submissionDate: new Date(registration.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    });

    if (isSupabaseConfigured && registrationId) {
      try {
        const supabase = getServiceSupabase();
        if (supabase) {
          await supabase
            .from('registrations')
            .update({ email_status: emailResult.success ? 'SENT' : 'FAILED' })
            .eq('id', registrationId);
        }
      } catch (sbErr) {
        console.warn('Could not update email_status in Supabase:', sbErr);
      }
    }

    return NextResponse.json({
      success: emailResult.success,
      message: emailResult.success 
        ? `Confirmation email successfully dispatched to ${registration.email} [Code: ${registration.public_code}]!` 
        : 'Failed to dispatch email.',
      error: emailResult.error
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
