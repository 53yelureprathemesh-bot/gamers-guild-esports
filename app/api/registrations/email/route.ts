import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';
import { sendRegistrationConfirmationEmail } from '@/lib/email';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

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
        const cleanId = String(registrationId).trim().replace(/^#/, '');
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
        let query = supabase.from('registrations').select('*, events(title)');
        query = isUuid ? query.eq('id', cleanId) : query.ilike('public_code', cleanId);
        const { data, error: qErr } = await query.maybeSingle();
        if (qErr) {
          console.warn('Supabase find registration for email resend query note:', qErr.message);
        }
        if (data) {
          registration = {
            ...data,
            event_title: data.events?.title || 'Gamers Guild Championship'
          };
        }
      }
    }

    if (!registration) {
      registration = dataStore.getRegistrations().find(r => 
        r.id === registrationId || 
        r.public_code.toLowerCase() === String(registrationId).toLowerCase().replace(/^#/, '')
      );
    }

    if (!registration) {
      return NextResponse.json({ success: false, error: 'Registration record not found.' }, { status: 404 });
    }

    // Send confirmation email keeping exact same registration code and all player details
    const emailResult = await sendRegistrationConfirmationEmail({
      to: registration.email,
      playerName: registration.player_name,
      registrationCode: registration.public_code,
      eventName: registration.event_title || 'Gamers Guild Championship',
      game: registration.game || 'BGMI (Battlegrounds Mobile India)',
      inGameName: registration.in_game_name || 'N/A',
      playerUid: registration.player_uid || 'N/A',
      teamName: registration.team_name || 'N/A',
      teamRole: registration.team_role || 'Player',
      state: registration.state,
      district: registration.district || '',
      city: registration.city || '',
      phone: registration.phone || '',
      gamingExperience: registration.gaming_experience || '',
      status: registration.status,
      submissionDate: new Date(registration.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      adminNotes: registration.admin_notes || ''
    });

    if (isSupabaseConfigured && registration?.id) {
      try {
        const supabase = getServiceSupabase();
        if (supabase) {
          await supabase
            .from('registrations')
            .update({ email_status: emailResult.success ? 'SENT' : 'FAILED' })
            .eq('id', registration.id);
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
