import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';
import { formStore } from '@/lib/defaultForm';
import { sendRegistrationConfirmationEmail } from '@/lib/email';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'find-registration': {
        const rawPhone = (searchParams.get('phone') || searchParams.get('query') || '').trim();
        const rawCode = (searchParams.get('code') || '').trim().replace(/^#/, '');

        const cleanDigits = rawPhone.replace(/\D/g, '');
        // Require at least 10 digits for mobile verification to prevent unauthorized scraping
        if (cleanDigits.length < 10) {
          return NextResponse.json({
            success: false,
            error: 'Please enter your full 10-digit registered mobile number to verify your registration.'
          }, { status: 400 });
        }

        const last10 = cleanDigits.slice(-10);

        if (isSupabaseConfigured) {
          const supabase = getServiceSupabase();
          if (supabase) {
            let query = supabase
              .from('registrations')
              .select('id, public_code, player_name, in_game_name, player_uid, team_name, team_role, game, event_title, state, district, city, phone, email, status, created_at, events(title)')
              .ilike('phone', `%${last10}%`);

            if (rawCode) {
              query = query.ilike('public_code', rawCode);
            }

            const { data: dbData } = await query;
            if (dbData && dbData.length > 0) {
              const mapped = dbData.map((d: any) => ({
                ...d,
                event_title: d.events?.title || d.event_title || 'Gamers Guild Tournament',
                files: undefined,
                answers: undefined
              }));
              return NextResponse.json({ success: true, data: mapped });
            }
          }
        }

        const results = dataStore.findRegistrationsByPhone(rawPhone, rawCode).map(r => ({
          ...r,
          files: undefined,
          answers: undefined
        }));
        return NextResponse.json({ success: true, data: results });
      }
      case 'events':
        return NextResponse.json({ success: true, data: dataStore.getEvents() });
      case 'points-table':
        return NextResponse.json({ success: true, data: dataStore.getPointsTable(searchParams.get('eventId') || undefined) });
      case 'matches':
        return NextResponse.json({ success: true, data: dataStore.getMatches(searchParams.get('eventId') || undefined) });
      case 'registrations': {
        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              const { data: dbData } = await supabase
                .from('registrations')
                .select('*, events(title), registration_files(*)')
                .order('created_at', { ascending: false });
              if (dbData && dbData.length > 0) {
                const mapped = dbData.map((d: any) => ({
                  ...d,
                  event_title: d.events?.title || 'Gamers Guild Tournament',
                  files: (d.registration_files && Array.isArray(d.registration_files) && d.registration_files.length > 0)
                    ? d.registration_files.map((rf: any) => ({
                        id: rf.id,
                        file_name: rf.file_name,
                        file_url: rf.file_url,
                        mime_type: rf.mime_type,
                        file_size: rf.file_size,
                        is_private: rf.is_private
                      }))
                    : (d.files || [])
                }));
                return NextResponse.json({ success: true, data: mapped });
              }
            }
          } catch (e) {
            console.warn('Supabase fetch registrations warning:', e);
          }
        }
        return NextResponse.json({ success: true, data: dataStore.getRegistrations() });
      }
      case 'form-fields':
        return NextResponse.json({ success: true, data: formStore.getFields() });
      case 'announcements':
        return NextResponse.json({ success: true, data: dataStore.getAnnouncements() });
      case 'gallery':
        return NextResponse.json({ success: true, data: dataStore.getGallery() });
      case 'sponsors':
        return NextResponse.json({ success: true, data: dataStore.getSponsors() });
      case 'settings':
        return NextResponse.json({ success: true, data: dataStore.getSiteSettings() });
      case 'admins': {
        const safeAdmins = dataStore.getAdmins().map(({ password, ...rest }) => ({
          ...rest,
          has_password: Boolean(password)
        }));
        return NextResponse.json({ success: true, data: safeAdmins });
      }
      case 'status':
        return NextResponse.json({
          success: true,
          commit: 'c10-smtp-support',
          supabaseConfigured: isSupabaseConfigured,
          hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
          hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
          hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
          hasResendKey: Boolean(process.env.RESEND_API_KEY),
          hasSmtp: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
          smtpUser: process.env.SMTP_USER ? process.env.SMTP_USER.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null
        });
      default: {
        let registrations = dataStore.getRegistrations();
        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              const { data: dbData } = await supabase
                .from('registrations')
                .select('*, events(title), registration_files(*)')
                .order('created_at', { ascending: false });
              if (dbData && dbData.length > 0) {
                registrations = dbData.map((d: any) => ({
                  ...d,
                  event_title: d.events?.title || 'Gamers Guild Tournament',
                  files: (d.registration_files && Array.isArray(d.registration_files) && d.registration_files.length > 0)
                    ? d.registration_files.map((rf: any) => ({
                        id: rf.id,
                        file_name: rf.file_name,
                        file_url: rf.file_url,
                        mime_type: rf.mime_type,
                        file_size: rf.file_size,
                        is_private: rf.is_private
                      }))
                    : (d.files || [])
                }));
              }
            }
          } catch (e) {
            console.warn('Supabase fetch registrations in default:', e);
          }
        }
        return NextResponse.json({
          success: true,
          data: {
            events: dataStore.getEvents(),
            registrations: registrations,
            settings: dataStore.getSiteSettings(),
            formFields: formStore.getFields(),
            announcements: dataStore.getAnnouncements(),
            gallery: dataStore.getGallery(),
            sponsors: dataStore.getSponsors(),
            admins: dataStore.getAdmins().map(({ password, ...rest }) => ({ ...rest, has_password: Boolean(password) }))
          }
        });
      }
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    switch (action) {
      case 'save-event': {
        const saved = dataStore.saveEvent(payload);
        return NextResponse.json({ success: true, data: saved });
      }
      case 'update-stream-url': {
        const updated = dataStore.updateEventStream(payload.eventId, payload.streamUrl, payload.isLive ?? true);
        return NextResponse.json({ success: Boolean(updated), data: updated });
      }
      case 'delete-event': {
        const deleted = dataStore.deleteEvent(payload.id);
        return NextResponse.json({ success: deleted });
      }
      case 'update-registration-status': {
        let regRecord: any = null;
        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              await supabase
                .from('registrations')
                .update({ status: payload.status, admin_notes: payload.notes })
                .or(`id.eq.${payload.id},public_code.eq.${payload.id}`);

              const { data } = await supabase
                .from('registrations')
                .select('*, events(title)')
                .or(`id.eq.${payload.id},public_code.eq.${payload.id}`)
                .single();
              if (data) regRecord = data;
            }
          } catch (e) {
            console.warn('Supabase update registration status error:', e);
          }
        }
        const updated = dataStore.updateRegistrationStatus(payload.id, payload.status, payload.notes);
        if (!regRecord && updated) {
          regRecord = updated;
        }

        // Automatically dispatch status update email to the participant (Pending, Approved, etc.)
        if (regRecord && regRecord.email) {
          try {
            const emailRes = await sendRegistrationConfirmationEmail({
              to: regRecord.email,
              playerName: regRecord.player_name,
              registrationCode: regRecord.public_code,
              eventName: regRecord.events?.title || regRecord.event_title || 'Gamers Guild Esports Championship',
              game: regRecord.game || 'BGMI (Battlegrounds Mobile India)',
              inGameName: regRecord.in_game_name || 'N/A',
              playerUid: regRecord.player_uid || 'N/A',
              teamName: regRecord.team_name || 'N/A',
              teamRole: regRecord.team_role || 'Player',
              state: regRecord.state,
              district: regRecord.district || '',
              city: regRecord.city || '',
              phone: regRecord.phone || '',
              gamingExperience: regRecord.gaming_experience || '',
              status: payload.status,
              submissionDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
              adminNotes: payload.notes || ''
            });

            if (isSupabaseConfigured && regRecord.id) {
              const supabase = getServiceSupabase();
              if (supabase) {
                await supabase
                  .from('registrations')
                  .update({ email_status: emailRes.success ? 'SENT' : 'FAILED' })
                  .eq('id', regRecord.id);
              }
            }
          } catch (mailErr) {
            console.error('Auto status email dispatch error:', mailErr);
          }
        }

        return NextResponse.json({ success: Boolean(updated), data: updated });
      }
      case 'delete-registration': {
        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              await supabase
                .from('registrations')
                .delete()
                .or(`id.eq.${payload.id},public_code.eq.${payload.id}`);
            }
          } catch (e) {
            console.warn('Supabase delete registration error:', e);
          }
        }
        const deleted = dataStore.deleteRegistration(payload.id);
        return NextResponse.json({ success: deleted });
      }
      case 'save-points-entry': {
        const entry = dataStore.savePointsTableEntry(payload);
        return NextResponse.json({ success: true, data: entry });
      }
      case 'save-form-fields': {
        formStore.setFields(payload.fields);
        return NextResponse.json({ success: true, data: formStore.getFields() });
      }
      case 'add-form-field': {
        const field = formStore.addField(payload);
        return NextResponse.json({ success: true, data: field });
      }
      case 'update-form-field': {
        const field = formStore.updateField(payload.id, payload.updates);
        return NextResponse.json({ success: Boolean(field), data: field });
      }
      case 'delete-form-field': {
        const res = formStore.deleteField(payload.id);
        return NextResponse.json({ success: res });
      }
      case 'duplicate-form-field': {
        const dup = formStore.duplicateField(payload.id);
        return NextResponse.json({ success: Boolean(dup), data: dup });
      }
      case 'save-announcement': {
        const ann = dataStore.saveAnnouncement(payload);
        return NextResponse.json({ success: true, data: ann });
      }
      case 'delete-announcement': {
        const res = dataStore.deleteAnnouncement(payload.id);
        return NextResponse.json({ success: res });
      }
      case 'save-gallery': {
        const gal = dataStore.saveGalleryItem(payload);
        return NextResponse.json({ success: true, data: gal });
      }
      case 'delete-gallery': {
        const res = dataStore.deleteGalleryItem(payload.id);
        return NextResponse.json({ success: res });
      }
      case 'save-sponsor': {
        const sp = dataStore.saveSponsor(payload);
        return NextResponse.json({ success: true, data: sp });
      }
      case 'delete-sponsor': {
        const res = dataStore.deleteSponsor(payload.id);
        return NextResponse.json({ success: res });
      }
      case 'update-site-settings': {
        const updated = dataStore.updateSiteSettings(payload);
        return NextResponse.json({ success: true, data: updated });
      }
      case 'save-admin': {
        const adm = dataStore.saveAdmin(payload);
        const { password, ...safeAdm } = adm;
        return NextResponse.json({ success: true, data: safeAdm });
      }
      case 'delete-admin': {
        const res = dataStore.deleteAdmin(payload.id);
        return NextResponse.json({ success: res });
      }
      case 'send-test-email': {
        const targetEmail = payload.to;
        if (!targetEmail) {
          return NextResponse.json({ success: false, error: 'Target email is required.' }, { status: 400 });
        }
        const result = await sendRegistrationConfirmationEmail({
          to: targetEmail,
          playerName: payload.playerName || 'Participant Player',
          registrationCode: 'MH-TEST',
          eventName: 'Gamers Guild Championship (Test Dispatch)',
          state: 'Maharashtra',
          teamName: 'TEST SQUAD',
          status: 'VERIFIED (Test Approved)',
          submissionDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        });
        return NextResponse.json({
          success: result.success,
          message: result.success ? `Test email successfully dispatched directly to ${targetEmail}!` : 'Failed to dispatch test email.',
          error: result.error
        });
      }
      default:
        return NextResponse.json({ success: false, error: 'Unrecognized action.' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
