import nodemailer from 'nodemailer';

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
      'Access-Control-Allow-Headers':
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
    },
  });
}

export async function POST(request) {
  const corsHeaders = {
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
    'Access-Control-Allow-Headers':
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  };

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders });
  }

  // SECURITY: never send to a client-supplied address (that would make this an
  // open email relay). The recipient is fixed server-side.
  const { userEmail, userName, plotId, plotTitle, plotLocation, plotPrice, plotSize } = body;
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || 'ykandoi20330@gmail.com';

  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');

  const emailSubject = `🚀 New Property Interest Registered: ${plotTitle}`;
  const emailHtml = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #3b7a76; margin-bottom: 20px;">
        <h2 style="color: #3b7a76; margin: 0; font-size: 24px; font-weight: 800;">A1Plot</h2>
        <p style="font-size: 14px; color: #64748b; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 0.05em;">New Lead Registered</p>
      </div>
      <div style="padding: 10px 0;">
        <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
          Hello Admin,<br/><br/>
          A user has expressed interest in a property listing on <strong>A1Plot</strong>. Below are the contact and listing details:
        </p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px; font-weight: bold; border: 1px solid #e2e8f0; width: 35%; color: #475569;">Buyer Name:</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; color: #0f172a;">${userName}</td>
          </tr>
          <tr>
            <td style="padding: 12px; font-weight: bold; border: 1px solid #e2e8f0; color: #475569;">Buyer Email:</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0;"><a href="mailto:${userEmail}" style="color: #3b7a76; text-decoration: none; font-weight: 600;">${userEmail}</a></td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px; font-weight: bold; border: 1px solid #e2e8f0; color: #475569;">Property Title:</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; color: #0f172a; font-weight: 600;">${plotTitle}</td>
          </tr>
          <tr>
            <td style="padding: 12px; font-weight: bold; border: 1px solid #e2e8f0; color: #475569;">Location:</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; color: #0f172a;">${plotLocation}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px; font-weight: bold; border: 1px solid #e2e8f0; color: #475569;">Price:</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; color: #10b981; font-weight: bold; font-size: 16px;">${plotPrice}</td>
          </tr>
          <tr>
            <td style="padding: 12px; font-weight: bold; border: 1px solid #e2e8f0; color: #475569;">Plot Size:</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; color: #0f172a;">${plotSize}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 12px; font-weight: bold; border: 1px solid #e2e8f0; color: #475569;">Property ID:</td>
            <td style="padding: 12px; border: 1px solid #e2e8f0; font-family: monospace; font-size: 13px; color: #0f172a;">${plotId}</td>
          </tr>
        </table>
      </div>
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; text-align: center; margin-top: 25px;">
        <p style="margin: 0; font-size: 14px; color: #15803d; font-weight: 600;">
          Action Required: Get in touch with the buyer at <a href="mailto:${userEmail}" style="color: #166534; text-decoration: underline;">${userEmail}</a>.
        </p>
      </div>
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; margin-top: 30px; font-size: 12px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} A1Plot. Sent automatically from serverless notification service.
      </div>
    </div>
  `;

  // Local/dev mock fallback when SMTP credentials are not configured
  if (!smtpUser || !smtpPass) {
    console.log('------------------ SMTP NOT CONFIGURED ------------------');
    console.log('⚠️ SMTP credentials not found in env variables. Mock-sending email:');
    console.log('To:', adminEmail);
    console.log('From:', userEmail);
    console.log('Subject:', emailSubject);
    console.log('---------------------------------------------------------');
    return Response.json(
      { success: true, info: 'Mock email printed to server console. Setup SMTP_USER and SMTP_PASS to send live emails.', mock: true },
      { status: 200, headers: corsHeaders }
    );
  }

  try {
    let transporterConfig = {
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    };

    if (smtpHost.includes('gmail') || smtpUser.includes('gmail')) {
      transporterConfig = { service: 'gmail', auth: { user: smtpUser, pass: smtpPass } };
    }

    const transporter = nodemailer.createTransport(transporterConfig);
    const mailOptions = {
      from: `"A1Plot Lead Alert" <${smtpUser}>`,
      to: adminEmail,
      replyTo: userEmail,
      subject: emailSubject,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Live email sent:', info.messageId);
    return Response.json({ success: true, messageId: info.messageId }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return Response.json({ error: 'Internal Server Error', details: error.message }, { status: 500, headers: corsHeaders });
  }
}
