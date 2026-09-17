import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/dataStore';
import { sendRegistrationConfirmationEmail } from '@/lib/email';
import { getServiceSupabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { getStateCode } from '@/lib/stateCodes';

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

    // Strict Validation
    if (!playerName || !email || !phone || !state || !district || !city || !game || !inGameName || !playerUid || !teamName) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required fields.' },
        { status: 400 }
      );
    }

    let publicCode = '';
    let registrationId = '';
    let eventTitle = '';

    // Check if live Supabase is configured
    if (isSupabaseConfigured) {
      const supabase = getServiceSupabase();
      if (supabase) {
        // Concurrency-safe atomic state code generation via stored procedure
        const codePrefix = getStateCode(state);
        const { data: codeResult, error: codeErr } = await supabase.rpc('generate_state_registration_code', {
          p_state_code: codePrefix
        });

        if (codeErr || !codeResult) {
          console.error('Supabase atomic code RPC error:', codeErr);
          // Fallback to timestamp code if RPC fails
          publicCode = `${codePrefix}${Math.floor(100 + Math.random() * 900)}`;
        } else {
          publicCode = codeResult;
        }

        // Insert registration record into Supabase
        const { data: regData, error: regErr } = await supabase
          .from('registrations')
          .insert({
            public_code: publicCode,
            event_id: eventId || null,
            player_name: playerName,
            email: email,
            phone: phone,
            date_of_birth: dateOfBirth || null,
            gender: gender || null,
            state: state,
            district: district,
            city: city,
            game: game,
            in_game_name: inGameName,
            player_uid: playerUid,
            team_name: teamName,
            team_role: teamRole || null,
            gaming_experience: gamingExperience || null,
            status: 'PENDING',
            email_status: 'SENDING'
          })
          .select()
          .single();

        if (regErr) {
          console.error('Supabase registration insert error:', regErr);
          throw new Error(regErr.message);
        }

        registrationId = regData.id;

        // Insert answers if any
        if (answers && Object.keys(answers).length > 0) {
          const answerRows = Object.entries(answers).map(([key, val]) => ({
            registration_id: registrationId,
            field_label: key,
            value: val
          }));
          await supabase.from('registration_answers').insert(answerRows);
        }

        // Insert uploaded file references if any
        if (files && Array.isArray(files) && files.length > 0) {
          const fileRows = files.map((f: any) => ({
            registration_id: registrationId,
            file_name: f.fileName,
            file_url: f.fileUrl,
            storage_path: f.storagePath || '',
            file_size: f.fileSize || 0,
            mime_type: f.mimeType || 'application/octet-stream',
            is_private: true
          }));
          await supabase.from('registration_files').insert(fileRows);
        }

        // Fetch event title for email
        if (eventId) {
          const { data: eventData } = await supabase.from('events').select('title').eq('id', eventId).single();
          if (eventData) eventTitle = eventData.title;
        }
      }
    }

    // If Supabase not configured or in local demo mode, use the atomic DataStore
    if (!publicCode) {
      const reg = dataStore.createRegistration({
        event_id: eventId || 'evt-001',
        form_id: 'form-default',
        player_name: playerName,
        email: email,
        phone: phone,
        date_of_birth: dateOfBirth,
        gender: gender,
        state: state,
        district: district,
        city: city,
        game: game,
        in_game_name: inGameName,
        player_uid: playerUid,
        team_name: teamName,
        team_role: teamRole,
        gaming_experience: gamingExperience,
        answers: answers || {},
        files: files || []
      });
      publicCode = reg.public_code;
      registrationId = reg.id;
      eventTitle = reg.event_title || 'Gamers Guild Championship';
    }

    // Automatically send confirmation email
    const emailResult = await sendRegistrationConfirmationEmail({
      to: email,
      playerName: playerName,
      registrationCode: publicCode,
      eventName: eventTitle || 'Gamers Guild Esports Championship',
      state: state,
      teamName: teamName,
      status: 'PENDING (Verification in Progress)',
      submissionDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    });

    return NextResponse.json({
      success: true,
      publicCode: publicCode,
      registrationId: registrationId,
      emailSent: emailResult.success,
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
