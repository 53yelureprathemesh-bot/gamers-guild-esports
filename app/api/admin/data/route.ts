import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';
import { formStore } from '@/lib/defaultForm';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'find-registration': {
        const query = searchParams.get('query') || '';
        if (isSupabaseConfigured) {
          const supabase = getServiceSupabase();
          if (supabase) {
            const cleanQuery = query.trim().replace(/^#/, '');
            const { data: dbData } = await supabase
              .from('registrations')
              .select('*, events(title)')
              .or(`public_code.ilike.%${cleanQuery}%,email.ilike.%${cleanQuery}%,phone.ilike.%${cleanQuery}%,player_name.ilike.%${cleanQuery}%,team_name.ilike.%${cleanQuery}%,player_uid.ilike.%${cleanQuery}%`);
            if (dbData && dbData.length > 0) {
              const mapped = dbData.map((d: any) => ({
                ...d,
                event_title: d.events?.title || 'Gamers Guild Tournament'
              }));
              return NextResponse.json({ success: true, data: mapped });
            }
          }
        }
        const results = dataStore.findRegistrations(query);
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
                .select('*, events(title)')
                .order('created_at', { ascending: false });
              if (dbData && dbData.length > 0) {
                const mapped = dbData.map((d: any) => ({
                  ...d,
                  event_title: d.events?.title || 'Gamers Guild Tournament'
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
      case 'admins':
        return NextResponse.json({ success: true, data: dataStore.getAdmins() });
      case 'status':
        return NextResponse.json({
          success: true,
          commit: 'c8-production',
          supabaseConfigured: isSupabaseConfigured,
          hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
          hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
          hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
          hasResendKey: Boolean(process.env.RESEND_API_KEY)
        });
      default: {
        let registrations = dataStore.getRegistrations();
        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              const { data: dbData } = await supabase
                .from('registrations')
                .select('*, events(title)')
                .order('created_at', { ascending: false });
              if (dbData && dbData.length > 0) {
                registrations = dbData.map((d: any) => ({
                  ...d,
                  event_title: d.events?.title || 'Gamers Guild Tournament'
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
            admins: dataStore.getAdmins()
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
        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              await supabase
                .from('registrations')
                .update({ status: payload.status, admin_notes: payload.notes })
                .or(`id.eq.${payload.id},public_code.eq.${payload.id}`);
            }
          } catch (e) {
            console.warn('Supabase update registration status error:', e);
          }
        }
        const updated = dataStore.updateRegistrationStatus(payload.id, payload.status, payload.notes);
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
        return NextResponse.json({ success: true, data: adm });
      }
      default:
        return NextResponse.json({ success: false, error: 'Unrecognized action.' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
