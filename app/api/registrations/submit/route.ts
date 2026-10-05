import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';
import { sendRegistrationConfirmationEmail } from '@/lib/email';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { getStateCode } from '@/lib/stateCodes';

export const dynamic = 'force-dynamic';

function parseToPostgresDate(val?: any): string | null {
  if (!val) return null;
  const s = String(val).trim();
  if (!s) return null;

  // Already ISO format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return s;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    const iso = `${year}-${month}-${day}`;
    const d = new Date(iso);
    if (!isNaN(d.getTime())) return iso;
  }

  // YYYY/MM/DD
  const ymdMatch = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    const iso = `${year}-${month}-${day}`;
    const d = new Date(iso);
    if (!isNaN(d.getTime())) return iso;
  }

  // Numeric age like "18" (e.g. between 5 and 99 years)
  const ageNum = parseInt(s, 10);
  if (!isNaN(ageNum) && ageNum >= 5 && ageNum <= 99 && s.length <= 2) {
    const approxYear = new Date().getFullYear() - ageNum;
    return `${approxYear}-01-01`;
  }

  // Numeric birth year like "2004"
  if (!isNaN(ageNum) && ageNum >= 1950 && ageNum <= 2025 && s.length === 4) {
    return `${ageNum}-01-01`;
  }

  // General date parseable by Date constructor
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    try {
      return parsed.toISOString().split('T')[0];
    } catch {
      return null;
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      eventId,
      playerName,
      email,
      phone,
      dateOfBirth,
      gender,
      state,
      district,
      city,
      game,
      inGameName,
      playerUid,
      teamName,
      teamRole,
      gamingExperience,
      answers,
      files
    } = body;

    // Check if registrations are open
    let currentSettings = dataStore.getSiteSettings();
    if (isSupabaseConfigured) {
      try {
        const supabase = getServiceSupabase();
        if (supabase) {
          const { data: sysEvent } = await supabase
            .from('events')
            .select('rules')
            .eq('slug', 'system-site-settings')
            .single();
          if (sysEvent?.rules && typeof sysEvent.rules === 'object') {
            currentSettings = { ...currentSettings, ...(sysEvent.rules as any) };
          }
        }
      } catch (e) {
        // fallback to memory
      }
    }

    if (currentSettings.registration_enabled === false) {
      return NextResponse.json(
        { 
          success: false, 
          error: currentSettings.registration_closed_message || 'Tournament registrations are currently closed.' 
        },
        { status: 403 }
      );
    }

    // Flexible Validation: enforce essential identity fields
    const safePlayerName = (playerName || '').trim();
    const safeEmail = (email || '').trim();
    const safePhone = (phone || '').trim();
    const safeInGameName = (inGameName || '').trim() || safePlayerName || 'Operator';
    const safePlayerUid = (playerUid || '').trim() || String(Date.now()).slice(-8);

    if (!safePlayerName || !safeEmail || !safePhone) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all essential required fields (Full Name, Email, and Phone).' },
        { status: 400 }
      );
    }

    const safeState = (state || '').trim() || 'Maharashtra';
    const safeDistrict = (district || '').trim() || 'General';
    const safeCity = (city || '').trim() || 'General';
    const safeGame = (game || '').trim() || 'BGMI (Battlegrounds Mobile India)';
    const safeTeamName = (teamName || '').trim() || `${safePlayerName}'s Squad`;

    // Process Date of Birth: sanitize for Postgres DATE column while preserving raw string in answers
    const parsedDob = parseToPostgresDate(dateOfBirth);
    const safeAnswers: Record<string, any> = { ...(answers || {}) };
    if (dateOfBirth && !safeAnswers['Date of Birth']) {
      safeAnswers['Date of Birth'] = String(dateOfBirth);
    }

    let publicCode = '';
    let registrationId = '';
    let eventTitle = '';

    // Check if live Supabase is configured
    // Attempt insertion into Supabase if configured
    if (isSupabaseConfigured) {
      try {
        const supabase = getServiceSupabase();
        if (supabase) {
          const codePrefix = getStateCode(safeState);
          const { data: codeResult, error: codeErr } = await supabase.rpc('generate_state_registration_code', {
            p_state_code: codePrefix
          });

          if (codeErr || !codeResult) {
            publicCode = `${codePrefix}${Math.floor(100 + Math.random() * 900)}`;
          } else {
            publicCode = codeResult;
          }

          // Validate UUID format for event_id in PostgreSQL
          const isValidUuid = (str?: string) => Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));
          let cleanEventId = isValidUuid(eventId) ? eventId : null;

          if (!cleanEventId) {
            // Find active tournament event in Supabase
            const { data: activeEvt } = await supabase
              .from('events')
              .select('id, title')
              .neq('slug', 'system-site-settings')
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            if (activeEvt) {
              cleanEventId = activeEvt.id;
              eventTitle = activeEvt.title;
            }
          }

          const baseRegistration = {
            public_code: publicCode,
            event_id: cleanEventId,
            player_name: safePlayerName,
            email: safeEmail,
            phone: safePhone,
            date_of_birth: parsedDob,
            gender: gender || 'Male',
            state: safeState,
            district: safeDistrict,
            city: safeCity,
            game: safeGame,
            in_game_name: safeInGameName,
            player_uid: safePlayerUid,
            team_name: safeTeamName,
            team_role: teamRole || 'Player',
            gaming_experience: gamingExperience || null,
            status: 'PENDING',
            email_status: 'SENDING'
          };

          let regData: any = null;
          let regErr: any = null;

          // Attempt insertion with retry for unique public_code or date formatting
          for (let attempt = 0; attempt < 3; attempt++) {
            const currentPublicCode = attempt === 0 ? publicCode : `${codePrefix}${Math.floor(1000 + Math.random() * 9000)}`;
            const insertPayload = { ...baseRegistration, public_code: currentPublicCode };

            const insertResult = await supabase
              .from('registrations')
              .insert(insertPayload)
              .select()
              .single();

            if (!insertResult.error && insertResult.data) {
              regData = insertResult.data;
              publicCode = currentPublicCode;
              regErr = null;
              break;
            }

            regErr = insertResult.error;

            // If error is date-related, immediately retry with date_of_birth: null
            if (regErr && (regErr.message?.includes('date') || regErr.code === '22007' || regErr.code === '22008')) {
              const retryNoDate = await supabase
                .from('registrations')
                .insert({ ...insertPayload, date_of_birth: null })
                .select()
                .single();

              if (!retryNoDate.error && retryNoDate.data) {
                regData = retryNoDate.data;
                publicCode = currentPublicCode;
                regErr = null;
                break;
              }
              regErr = retryNoDate.error;
            }
          }

          if (regErr || !regData) {
            console.error('CRITICAL: Supabase registration insertion failure:', regErr);
            return NextResponse.json({
              success: false,
              error: `Database registration error: ${regErr?.message || 'Could not save registration'}. Please verify details and try again.`
            }, { status: 500 });
          }

          registrationId = regData.id;

          if (safeAnswers && Object.keys(safeAnswers).length > 0) {
            try {
              const answerRows = Object.entries(safeAnswers).map(([key, val]) => ({
                registration_id: registrationId,
                field_label: key,
                value: typeof val === 'object' ? val : JSON.stringify(val)
              }));
              await supabase.from('registration_answers').insert(answerRows);
            } catch (ansErr) {
              console.warn('Could not insert custom answers:', ansErr);
            }
          }

          if (files && Array.isArray(files) && files.length > 0) {
            try {
              const fileRows = files.map((f: any) => ({
                registration_id: registrationId,
                file_name: f.fileName || f.name || 'document',
                file_url: f.fileUrl || f.url || '',
                storage_path: f.storagePath || '',
                file_size: typeof f.fileSize === 'number' ? f.fileSize : 0,
                mime_type: f.mimeType || f.type || 'application/octet-stream',
                is_private: true
              }));
              await supabase.from('registration_files').insert(fileRows);
            } catch (fileErr) {
              console.warn('Could not insert files:', fileErr);
            }
          }

          if (cleanEventId && !eventTitle) {
            const { data: eventData } = await supabase.from('events').select('title').eq('id', cleanEventId).single();
            if (eventData) eventTitle = eventData.title;
          }
        }
      } catch (sbError: any) {
        console.error('Supabase submission caught exception:', sbError);
        return NextResponse.json({
          success: false,
          error: `Database connectivity error: ${sbError.message || 'Service unavailable'}. Please try again.`
        }, { status: 500 });
      }
    }

    // Always ensure DataStore contains this registration
    const reg = dataStore.createRegistration({
      id: registrationId || undefined,
      public_code: publicCode || undefined,
      event_id: eventId || 'evt-001',
      form_id: 'form-default',
      player_name: playerName,
      email: email,
      phone: phone,
      date_of_birth: dateOfBirth,
      gender: gender,
      state: safeState,
      district: safeDistrict,
      city: safeCity,
      game: safeGame,
      in_game_name: inGameName,
      player_uid: playerUid,
      team_name: safeTeamName,
      team_role: teamRole,
      gaming_experience: gamingExperience,
      answers: answers || {},
      files: files || []
    });

    publicCode = reg.public_code;
    registrationId = reg.id;
    eventTitle = eventTitle || reg.event_title || 'Gamers Guild Championship';

    // Non-blocking asynchronous email dispatch (resilient to 5,000 concurrent submissions)
    const emailPromise = sendRegistrationConfirmationEmail({
      to: email,
      playerName: playerName,
      registrationCode: publicCode,
      eventName: eventTitle || 'Gamers Guild Esports Championship',
      game: game || 'BGMI (Battlegrounds Mobile India)',
      inGameName: inGameName,
      playerUid: playerUid,
      teamName: teamName,
      teamRole: teamRole || 'Player',
      state: state,
      district: district,
      city: city,
      phone: phone,
      gamingExperience: gamingExperience || '',
      dateOfBirth: dateOfBirth || '',
      gender: gender || '',
      status: 'PENDING (Under Review)',
      submissionDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    }).then(async (emailResult) => {
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
      return emailResult;
    }).catch(err => {
      console.error('Background confirmation email dispatch error:', err);
      return { success: false, error: err.message };
    });

    // Await email dispatch directly so serverless functions don't terminate mid-flight
    const emailResult = await Promise.race([
      emailPromise,
      new Promise<{ success: boolean; error?: string }>(resolve => 
        setTimeout(() => resolve({ success: false, error: 'Email delivery timed out after 8s.' }), 8000)
      )
    ]);

    return NextResponse.json({
      success: true,
      publicCode: publicCode,
      registrationId: registrationId,
      emailSent: emailResult.success,
      emailError: emailResult.error || null,
      message: 'Registration successfully recorded!'
    });
  } catch (error: any) {
    console.error('Submission API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error occurred.' },
      { status: 500 }
    );
  }
}
