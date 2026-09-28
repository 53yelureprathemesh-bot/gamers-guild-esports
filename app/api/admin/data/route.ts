import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';
import { formStore } from '@/lib/defaultForm';
import { sendRegistrationConfirmationEmail } from '@/lib/email';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { getAdminFromRequest } from '@/lib/auth';
import { getCached, setCached, invalidateCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma': 'no-cache'
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    switch (type) {
      // 1. PUBLIC FIND REGISTRATION (Strict 10-digit mobile verification)
      case 'find-registration': {
        const rawPhone = (searchParams.get('phone') || searchParams.get('query') || '').trim();
        const rawCode = (searchParams.get('code') || '').trim().replace(/^#/, '');

        const cleanDigits = rawPhone.replace(/\D/g, '');
        if (cleanDigits.length < 10) {
          return NextResponse.json({
            success: false,
            error: 'Please enter your full 10-digit registered mobile number to verify your registration.'
          }, { status: 400, headers: NO_CACHE_HEADERS });
        }

        const last10 = cleanDigits.slice(-10);

        if (isSupabaseConfigured) {
          const supabase = getServiceSupabase();
          if (supabase) {
            try {
              let query = supabase
                .from('registrations')
                .select('id, public_code, player_name, in_game_name, player_uid, team_name, team_role, game, event_id, event_title, state, district, city, phone, email, status, created_at, events(title)')
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
                return NextResponse.json({ success: true, data: mapped }, { headers: NO_CACHE_HEADERS });
              }
            } catch (e) {
              console.warn('Supabase find-registration fallback to memory:', e);
            }
          }
        }

        const results = dataStore.findRegistrationsByPhone(rawPhone, rawCode).map(r => ({
          ...r,
          files: undefined,
          answers: undefined
        }));
        return NextResponse.json({ success: true, data: results }, { headers: NO_CACHE_HEADERS });
      }

      // 2. EVENTS (With High-Concurrency Cache)
      case 'events': {
        const cacheKey = 'cache:public_events';
        const cached = getCached<any[]>(cacheKey);
        if (cached) {
          return NextResponse.json({ success: true, data: cached }, { headers: NO_CACHE_HEADERS });
        }

        let events = dataStore.getEvents();
        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              const { data: dbEvents } = await supabase
                .from('events')
                .select('*')
                .order('date', { ascending: true });
              if (dbEvents && dbEvents.length > 0) {
                events = dbEvents;
              }
            }
          } catch (e) {
            console.warn('Supabase fetch events error:', e);
          }
        }

        setCached(cacheKey, events, 20); // 20s TTL
        return NextResponse.json({ success: true, data: events }, { headers: NO_CACHE_HEADERS });
      }

      // 3. REGISTRATIONS LIST (Optimized for 1 Lakh+ records with Pagination & Search)
      case 'registrations': {
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.min(200, Math.max(10, parseInt(searchParams.get('limit') || '50', 10)));
        const eventId = searchParams.get('eventId') || '';
        const status = searchParams.get('status') || '';
        const search = (searchParams.get('search') || searchParams.get('q') || '').trim();

        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              let query = supabase
                .from('registrations')
                .select('id, public_code, player_name, in_game_name, player_uid, team_name, team_role, game, event_id, event_title, state, district, city, phone, email, status, created_at, events(title)', { count: 'exact' });

              if (eventId && eventId !== 'ALL') {
                query = query.eq('event_id', eventId);
              }
              if (status && status !== 'ALL') {
                query = query.eq('status', status);
              }
              if (search) {
                query = query.or(`player_name.ilike.%${search}%,public_code.ilike.%${search}%,phone.ilike.%${search}%,team_name.ilike.%${search}%,in_game_name.ilike.%${search}%`);
              }

              const from = (page - 1) * limit;
              const to = from + limit - 1;
              query = query.order('created_at', { ascending: false }).range(from, to);

              const { data: dbData, count, error } = await query;
              if (!error && dbData) {
                const mapped = dbData.map((d: any) => ({
                  ...d,
                  event_title: d.events?.title || d.event_title || 'Gamers Guild Tournament'
                }));
                const total = count || 0;
                return NextResponse.json({
                  success: true,
                  data: mapped,
                  total,
                  page,
                  limit,
                  totalPages: Math.ceil(total / limit) || 1
                }, { headers: NO_CACHE_HEADERS });
              }
            }
          } catch (e) {
            console.warn('Supabase fetch registrations warning:', e);
          }
        }

        // Memory Store Fallback
        let allRegs = dataStore.getRegistrations();
        if (eventId && eventId !== 'ALL') {
          allRegs = allRegs.filter(r => r.event_id === eventId);
        }
        if (status && status !== 'ALL') {
          allRegs = allRegs.filter(r => r.status === status);
        }
        if (search) {
          const s = search.toLowerCase();
          allRegs = allRegs.filter(r => 
            r.player_name.toLowerCase().includes(s) ||
            r.public_code.toLowerCase().includes(s) ||
            r.phone.includes(s) ||
            r.team_name.toLowerCase().includes(s) ||
            (r.in_game_name && r.in_game_name.toLowerCase().includes(s))
          );
        }

        const total = allRegs.length;
        const from = (page - 1) * limit;
        const pageRows = allRegs.slice(from, from + limit);

        return NextResponse.json({
          success: true,
          data: pageRows,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1
        }, { headers: NO_CACHE_HEADERS });
      }

      // 4. ON-DEMAND REGISTRATION DETAIL (With full attached files & proofs)
      case 'registration-detail': {
        const id = searchParams.get('id');
        if (!id) {
          return NextResponse.json({ success: false, error: 'Registration ID required' }, { status: 400 });
        }

        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              const isUuid = UUID_REGEX.test(id);
              let query = supabase
                .from('registrations')
                .select('*, events(title), registration_files(*), registration_answers(*)');

              query = isUuid ? query.eq('id', id) : query.ilike('public_code', id);
              const { data: dbData } = await query.single();

              if (dbData) {
                const mapped = {
                  ...dbData,
                  event_title: dbData.events?.title || dbData.event_title || 'Gamers Guild Tournament',
                  files: (dbData.registration_files && dbData.registration_files.length > 0)
                    ? dbData.registration_files.map((rf: any) => ({
                        id: rf.id,
                        file_name: rf.file_name,
                        file_url: rf.file_url,
                        mime_type: rf.mime_type,
                        file_size: rf.file_size
                      }))
                    : (dbData.files || [])
                };
                return NextResponse.json({ success: true, data: mapped }, { headers: NO_CACHE_HEADERS });
              }
            }
          } catch (e) {
            console.warn('Supabase fetch registration detail error:', e);
          }
        }

        const reg = dataStore.getRegistrations().find(r => r.id === id || r.public_code.toLowerCase() === id.toLowerCase());
        return NextResponse.json({ success: Boolean(reg), data: reg }, { headers: NO_CACHE_HEADERS });
      }

      // 5. SITE SETTINGS & HOME CONTENT (With High-Concurrency Cache)
      case 'settings': {
        const cacheKey = 'cache:site_settings';
        const cached = getCached<any>(cacheKey);
        if (cached) {
          return NextResponse.json({ success: true, data: cached }, { headers: NO_CACHE_HEADERS });
        }

        let settings = dataStore.getSiteSettings();
        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              const { data: dbSettings } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'general_settings')
                .single();
              if (dbSettings && dbSettings.value) {
                settings = { ...settings, ...dbSettings.value };
                dataStore.updateSiteSettings(settings);
              }
            }
          } catch (e) {
            console.warn('Supabase fetch site settings error:', e);
          }
        }

        setCached(cacheKey, settings, 20); // 20s TTL
        return NextResponse.json({ success: true, data: settings }, { headers: NO_CACHE_HEADERS });
      }

      case 'points-table':
        return NextResponse.json({ success: true, data: dataStore.getPointsTable(searchParams.get('eventId') || undefined) }, { headers: NO_CACHE_HEADERS });

      case 'matches':
        return NextResponse.json({ success: true, data: dataStore.getMatches(searchParams.get('eventId') || undefined) }, { headers: NO_CACHE_HEADERS });

      case 'form-fields':
        return NextResponse.json({ success: true, data: formStore.getFields() }, { headers: NO_CACHE_HEADERS });

      case 'announcements': {
        let anns = dataStore.getAnnouncements();
        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              const { data: dbAnns } = await supabase
                .from('announcements')
                .select('*')
                .eq('is_published', true)
                .order('created_at', { ascending: false });
              if (dbAnns && dbAnns.length > 0) anns = dbAnns;
            }
          } catch (e) {
            console.warn('Supabase fetch announcements error:', e);
          }
        }
        return NextResponse.json({ success: true, data: anns }, { headers: NO_CACHE_HEADERS });
      }

      case 'gallery': {
        let gal = dataStore.getGallery();
        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              const { data: dbGal } = await supabase
                .from('gallery')
                .select('*')
                .eq('is_published', true)
                .order('sort_order', { ascending: true });
              if (dbGal && dbGal.length > 0) gal = dbGal;
            }
          } catch (e) {
            console.warn('Supabase fetch gallery error:', e);
          }
        }
        return NextResponse.json({ success: true, data: gal }, { headers: NO_CACHE_HEADERS });
      }

      case 'sponsors': {
        let sps = dataStore.getSponsors();
        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              const { data: dbSps } = await supabase
                .from('sponsors')
                .select('*')
                .order('tier', { ascending: true });
              if (dbSps && dbSps.length > 0) sps = dbSps;
            }
          } catch (e) {
            console.warn('Supabase fetch sponsors error:', e);
          }
        }
        return NextResponse.json({ success: true, data: sps }, { headers: NO_CACHE_HEADERS });
      }

      case 'admins': {
        // Restricted to authenticated admin sessions
        const adminSession = getAdminFromRequest(req);
        if (!adminSession) {
          return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: NO_CACHE_HEADERS });
        }
        const safeAdmins = dataStore.getAdmins().map(({ password, ...rest }) => ({
          ...rest,
          has_password: Boolean(password)
        }));
        return NextResponse.json({ success: true, data: safeAdmins }, { headers: NO_CACHE_HEADERS });
      }

      case 'status':
        return NextResponse.json({
          success: true,
          commit: 'c11-security-and-scaling',
          supabaseConfigured: isSupabaseConfigured,
          hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
          hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
          hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
          hasResendKey: Boolean(process.env.RESEND_API_KEY),
          hasSmtp: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS)
        }, { headers: NO_CACHE_HEADERS });

      default: {
        // Combined default summary with cache
        const cacheKey = 'cache:public_bundle';
        const cached = getCached<any>(cacheKey);
        if (cached) {
          return NextResponse.json({ success: true, data: cached }, { headers: NO_CACHE_HEADERS });
        }

        let events = dataStore.getEvents();
        let settings = dataStore.getSiteSettings();
        let announcements = dataStore.getAnnouncements();
        let gallery = dataStore.getGallery();
        let sponsors = dataStore.getSponsors();

        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              const [evRes, stRes, anRes, galRes, spRes] = await Promise.all([
                supabase.from('events').select('*').order('date', { ascending: true }),
                supabase.from('site_settings').select('value').eq('key', 'general_settings').single(),
                supabase.from('announcements').select('*').eq('is_published', true).order('created_at', { ascending: false }),
                supabase.from('gallery').select('*').eq('is_published', true).order('sort_order', { ascending: true }),
                supabase.from('sponsors').select('*').order('tier', { ascending: true })
              ]);

              if (evRes.data && evRes.data.length > 0) events = evRes.data;
              if (stRes.data && stRes.data.value) settings = { ...settings, ...stRes.data.value };
              if (anRes.data && anRes.data.length > 0) announcements = anRes.data;
              if (galRes.data && galRes.data.length > 0) gallery = galRes.data;
              if (spRes.data && spRes.data.length > 0) sponsors = spRes.data;
            }
          } catch (e) {
            console.warn('Supabase bundle fetch warning:', e);
          }
        }

        const bundle = {
          events,
          settings,
          formFields: formStore.getFields(),
          announcements,
          gallery,
          sponsors
        };

        setCached(cacheKey, bundle, 20); // 20s TTL
        return NextResponse.json({ success: true, data: bundle }, { headers: NO_CACHE_HEADERS });
      }
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}

export async function POST(req: NextRequest) {
  try {
    // SECURITY GATE: Verify Cryptographic Admin Session Token
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ACCESS DENIED: Administrative session authorization required. Please log in with valid admin credentials.' 
        },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const body = await req.json();
    const { action, payload } = body;

    switch (action) {
      // 1. SITE SETTINGS & HOME CONTENT PERSISTENCE
      case 'update-site-settings': {
        const updated = dataStore.updateSiteSettings(payload);

        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              await supabase
                .from('site_settings')
                .upsert({
                  key: 'general_settings',
                  value: updated,
                  description: 'Gamers Guild Esports visual site settings and registration controls',
                  updated_at: new Date().toISOString()
                }, { onConflict: 'key' });
            }
          } catch (e) {
            console.warn('Supabase site settings upsert error:', e);
          }
        }

        invalidateCache(); // Instantly bust cache so public site reflects edits
        return NextResponse.json({ success: true, data: updated }, { headers: NO_CACHE_HEADERS });
      }

      // 2. EVENT PERSISTENCE
      case 'save-event': {
        const saved = dataStore.saveEvent(payload);

        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              await supabase
                .from('events')
                .upsert({
                  id: saved.id,
                  slug: saved.slug,
                  title: saved.title,
                  game: saved.game,
                  poster_url: saved.poster_url,
                  date: saved.date,
                  time: saved.time,
                  venue: saved.venue,
                  mode: saved.mode,
                  prize_pool: saved.prize_pool,
                  entry_fee: saved.entry_fee,
                  registration_deadline: saved.registration_deadline,
                  total_slots: saved.total_slots,
                  filled_slots: saved.filled_slots,
                  description: saved.description,
                  rules: saved.rules,
                  status: saved.status,
                  is_published: saved.is_published,
                  stream_url: saved.stream_url,
                  is_stream_live: saved.is_stream_live
                }, { onConflict: 'id' });
            }
          } catch (e) {
            console.warn('Supabase save-event error:', e);
          }
        }

        invalidateCache();
        return NextResponse.json({ success: true, data: saved }, { headers: NO_CACHE_HEADERS });
      }

      case 'update-stream-url': {
        const updated = dataStore.updateEventStream(payload.eventId, payload.streamUrl, payload.isLive ?? true);
        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              await supabase
                .from('events')
                .update({ stream_url: payload.streamUrl, is_stream_live: payload.isLive ?? true })
                .eq('id', payload.eventId);
            }
          } catch (e) {
            console.warn('Supabase update stream error:', e);
          }
        }
        invalidateCache();
        return NextResponse.json({ success: Boolean(updated), data: updated }, { headers: NO_CACHE_HEADERS });
      }

      case 'delete-event': {
        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              await supabase.from('events').delete().eq('id', payload.id);
            }
          } catch (e) {
            console.warn('Supabase delete event error:', e);
          }
        }
        const deleted = dataStore.deleteEvent(payload.id);
        invalidateCache();
        return NextResponse.json({ success: deleted }, { headers: NO_CACHE_HEADERS });
      }

      // 3. REGISTRATION STATUS & NOTIFICATIONS
      case 'update-registration-status': {
        let regRecord: any = null;
        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              const isUuid = UUID_REGEX.test(payload.id);
              let q = supabase.from('registrations').update({ status: payload.status, admin_notes: payload.notes });
              q = isUuid ? q.eq('id', payload.id) : q.ilike('public_code', payload.id);
              await q;

              let selQ = supabase.from('registrations').select('*, events(title)');
              selQ = isUuid ? selQ.eq('id', payload.id) : selQ.ilike('public_code', payload.id);
              const { data } = await selQ.single();
              if (data) regRecord = data;
            }
          } catch (e) {
            console.warn('Supabase update registration status error:', e);
          }
        }

        const updated = dataStore.updateRegistrationStatus(payload.id, payload.status, payload.notes);
        if (!regRecord && updated) regRecord = updated;

        // Automatically dispatch status update email to the participant
        if (regRecord && regRecord.email) {
          sendRegistrationConfirmationEmail({
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
          }).catch(e => console.error('Status email dispatch error:', e));
        }

        invalidateCache();
        return NextResponse.json({ success: Boolean(updated), data: updated }, { headers: NO_CACHE_HEADERS });
      }

      // 4. FIX SINGLE REGISTRATION DELETION (UUID-safe and foreign-key safe)
      case 'delete-registration': {
        const regId = payload.id;
        if (!regId) {
          return NextResponse.json({ success: false, error: 'Registration ID required' }, { status: 400 });
        }

        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              const isUuid = UUID_REGEX.test(regId);
              // 1. Locate the exact record ID
              let findQuery = supabase.from('registrations').select('id');
              findQuery = isUuid ? findQuery.eq('id', regId) : findQuery.ilike('public_code', regId);
              const { data: record } = await findQuery.single();

              if (record && record.id) {
                // 2. Delete foreign-key child entries first
                await supabase.from('registration_files').delete().eq('registration_id', record.id);
                await supabase.from('registration_answers').delete().eq('registration_id', record.id);
                // 3. Delete parent registration entry
                await supabase.from('registrations').delete().eq('id', record.id);
              }
            }
          } catch (e) {
            console.warn('Supabase delete registration error:', e);
          }
        }

        const deleted = dataStore.deleteRegistration(regId);
        invalidateCache();
        return NextResponse.json({ success: true, message: 'Registration successfully deleted.' }, { headers: NO_CACHE_HEADERS });
      }

      // 5. BULK PURGE: CLEAR ALL REGISTRATIONS FOR A SPECIFIC EVENT
      case 'clear-event-registrations': {
        const targetEventId = payload.eventId;
        if (!targetEventId) {
          return NextResponse.json({ success: false, error: 'Event ID required for event purge' }, { status: 400 });
        }

        let purgedCount = 0;
        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              // 1. Find all registration IDs for this event
              const { data: regs } = await supabase
                .from('registrations')
                .select('id')
                .eq('event_id', targetEventId);

              if (regs && regs.length > 0) {
                const regIds = regs.map(r => r.id);
                purgedCount = regIds.length;
                // Delete child proofs and answers
                await supabase.from('registration_files').delete().in('registration_id', regIds);
                await supabase.from('registration_answers').delete().in('registration_id', regIds);
                // Delete registrations
                await supabase.from('registrations').delete().eq('event_id', targetEventId);
              }
            }
          } catch (e) {
            console.warn('Supabase clear-event-registrations error:', e);
          }
        }

        const initialMem = dataStore.getRegistrations().length;
        dataStore.setRegistrations(dataStore.getRegistrations().filter(r => r.event_id !== targetEventId));
        const memPurged = initialMem - dataStore.getRegistrations().length;

        invalidateCache();
        return NextResponse.json({ 
          success: true, 
          message: `Successfully purged all registrations for this tournament. (${Math.max(purgedCount, memPurged)} records removed)` 
        }, { headers: NO_CACHE_HEADERS });
      }

      // 6. GLOBAL PURGE: CLEAR ALL REGISTRATIONS (Entire System)
      case 'clear-all-registrations': {
        if (admin.role !== 'SUPER_ADMIN' && admin.role !== 'REGISTRATION_MANAGER') {
          return NextResponse.json({ success: false, error: 'Insufficient permissions for global data purge.' }, { status: 403 });
        }

        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              await supabase.from('registration_files').delete().neq('id', '00000000-0000-0000-0000-000000000000');
              await supabase.from('registration_answers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
              await supabase.from('registrations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            }
          } catch (e) {
            console.warn('Supabase clear all registrations error:', e);
          }
        }

        dataStore.setRegistrations([]);
        invalidateCache();
        return NextResponse.json({ success: true, message: 'All registrations in the database have been purged successfully.' }, { headers: NO_CACHE_HEADERS });
      }

      // 7. ANNOUNCEMENTS PERSISTENCE
      case 'save-announcement': {
        const ann = dataStore.saveAnnouncement(payload);
        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              await supabase.from('announcements').upsert({
                id: ann.id,
                title: ann.title,
                content: ann.content,
                priority: ann.priority,
                image_url: ann.image_url,
                link: ann.link,
                is_published: ann.is_published
              }, { onConflict: 'id' });
            }
          } catch (e) {
            console.warn('Supabase save announcement error:', e);
          }
        }
        invalidateCache();
        return NextResponse.json({ success: true, data: ann }, { headers: NO_CACHE_HEADERS });
      }

      case 'delete-announcement': {
        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              await supabase.from('announcements').delete().eq('id', payload.id);
            }
          } catch (e) {
            console.warn('Supabase delete announcement error:', e);
          }
        }
        const res = dataStore.deleteAnnouncement(payload.id);
        invalidateCache();
        return NextResponse.json({ success: res }, { headers: NO_CACHE_HEADERS });
      }

      // 8. GALLERY PERSISTENCE
      case 'save-gallery': {
        const gal = dataStore.saveGalleryItem(payload);
        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              await supabase.from('gallery').upsert({
                id: gal.id,
                title: gal.title,
                description: gal.description,
                category: gal.category,
                image_url: gal.image_url,
                is_published: gal.is_published,
                sort_order: gal.sort_order
              }, { onConflict: 'id' });
            }
          } catch (e) {
            console.warn('Supabase save gallery error:', e);
          }
        }
        invalidateCache();
        return NextResponse.json({ success: true, data: gal }, { headers: NO_CACHE_HEADERS });
      }

      case 'delete-gallery': {
        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              await supabase.from('gallery').delete().eq('id', payload.id);
            }
          } catch (e) {
            console.warn('Supabase delete gallery error:', e);
          }
        }
        const res = dataStore.deleteGalleryItem(payload.id);
        invalidateCache();
        return NextResponse.json({ success: res }, { headers: NO_CACHE_HEADERS });
      }

      // 9. SPONSORS PERSISTENCE
      case 'save-sponsor': {
        const sp = dataStore.saveSponsor(payload);
        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              await supabase.from('sponsors').upsert({
                id: sp.id,
                name: sp.name,
                tier: sp.tier,
                logo_url: sp.logo_url,
                website_url: sp.website_url || sp.website || '',
                description: sp.description
              }, { onConflict: 'id' });
            }
          } catch (e) {
            console.warn('Supabase save sponsor error:', e);
          }
        }
        invalidateCache();
        return NextResponse.json({ success: true, data: sp }, { headers: NO_CACHE_HEADERS });
      }

      case 'delete-sponsor': {
        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              await supabase.from('sponsors').delete().eq('id', payload.id);
            }
          } catch (e) {
            console.warn('Supabase delete sponsor error:', e);
          }
        }
        const res = dataStore.deleteSponsor(payload.id);
        invalidateCache();
        return NextResponse.json({ success: res }, { headers: NO_CACHE_HEADERS });
      }

      // 10. POINTS TABLE PERSISTENCE
      case 'save-points-entry': {
        const entry = dataStore.savePointsTableEntry(payload);
        if (isSupabaseConfigured) {
          try {
            const supabase = getServiceSupabase();
            if (supabase) {
              await supabase.from('tournament_points_table').upsert({
                id: entry.id,
                event_id: entry.event_id,
                rank: entry.rank,
                team_name: entry.team_name,
                matches_played: entry.matches_played,
                wwcd: entry.wwcd,
                placement_points: entry.placement_points,
                kill_points: entry.kill_points,
                total_points: entry.total_points
              }, { onConflict: 'id' });
            }
          } catch (e) {
            console.warn('Supabase save points entry error:', e);
          }
        }
        invalidateCache();
        return NextResponse.json({ success: true, data: entry }, { headers: NO_CACHE_HEADERS });
      }

      // 11. FORM FIELDS
      case 'save-form-fields': {
        formStore.setFields(payload.fields);
        return NextResponse.json({ success: true, data: formStore.getFields() }, { headers: NO_CACHE_HEADERS });
      }
      case 'add-form-field': {
        const field = formStore.addField(payload);
        return NextResponse.json({ success: true, data: field }, { headers: NO_CACHE_HEADERS });
      }
      case 'update-form-field': {
        const field = formStore.updateField(payload.id, payload.updates);
        return NextResponse.json({ success: Boolean(field), data: field }, { headers: NO_CACHE_HEADERS });
      }
      case 'delete-form-field': {
        const res = formStore.deleteField(payload.id);
        return NextResponse.json({ success: res }, { headers: NO_CACHE_HEADERS });
      }

      // 12. ADMIN ACCOUNTS (Super Admin Only)
      case 'save-admin': {
        if (admin.role !== 'SUPER_ADMIN') {
          return NextResponse.json({ success: false, error: 'Only Super Admin can manage administrator credentials.' }, { status: 403 });
        }
        const adm = dataStore.saveAdmin(payload);
        const { password, ...safeAdm } = adm;
        return NextResponse.json({ success: true, data: safeAdm }, { headers: NO_CACHE_HEADERS });
      }
      case 'delete-admin': {
        if (admin.role !== 'SUPER_ADMIN') {
          return NextResponse.json({ success: false, error: 'Only Super Admin can delete administrators.' }, { status: 403 });
        }
        const res = dataStore.deleteAdmin(payload.id);
        return NextResponse.json({ success: res }, { headers: NO_CACHE_HEADERS });
      }

      // 13. LIVE TEST EMAIL DISPATCH
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
        }, { headers: NO_CACHE_HEADERS });
      }

      default:
        return NextResponse.json({ success: false, error: 'Unrecognized action.' }, { status: 400, headers: NO_CACHE_HEADERS });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
