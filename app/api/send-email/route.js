import nodemailer from 'nodemailer';

const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers':
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: CORS_HEADERS });
}

// ── Shared email styles ──────────────────────────────────────────────────────
const wrap = (inner) => `
<div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:25px;color:#1e293b;max-width:620px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;background:#fff;box-shadow:0 4px 6px rgba(0,0,0,.05);">
  <div style="text-align:center;padding-bottom:18px;border-bottom:2px solid #3b7a76;margin-bottom:20px;">
    <h2 style="color:#3b7a76;margin:0;font-size:22px;font-weight:800;">A1Plot</h2>
    <p style="font-size:13px;color:#64748b;margin:4px 0 0;text-transform:uppercase;letter-spacing:.05em;">Admin Notification</p>
  </div>
  ${inner}
  <div style="text-align:center;padding-top:18px;border-top:1px solid #e2e8f0;margin-top:28px;font-size:12px;color:#94a3b8;">
    &copy; ${new Date().getFullYear()} A1Plot &mdash; Sent automatically from serverless notification service.
  </div>
</div>`;

const row = (label, value, shade) =>
  `<tr style="${shade ? 'background:#f8fafc;' : ''}">
    <td style="padding:11px 12px;font-weight:600;border:1px solid #e2e8f0;width:38%;color:#475569;">${label}</td>
    <td style="padding:11px 12px;border:1px solid #e2e8f0;color:#0f172a;">${value || '—'}</td>
  </tr>`;

const table = (rows) =>
  `<table style="width:100%;border-collapse:collapse;margin-top:14px;">${rows}</table>`;

// ── Email builders ───────────────────────────────────────────────────────────
function buildInterestEmail(body) {
  const { userEmail, userName, plotId, plotTitle, plotLocation, plotPrice, plotSize } = body;
  return {
    subject: `🚀 New Property Interest: ${plotTitle}`,
    html: wrap(`
      <p style="font-size:15px;line-height:1.6;color:#334155;margin-bottom:18px;">
        Hello Admin,<br/><br/>
        A user has expressed <strong>interest in a property listing</strong> on A1Plot.
      </p>
      ${table(
        row('Buyer Name', userName, true) +
        row('Buyer Email', `<a href="mailto:${userEmail}" style="color:#3b7a76;font-weight:600;">${userEmail}</a>`) +
        row('Property Title', `<strong>${plotTitle}</strong>`, true) +
        row('Location', plotLocation) +
        row('Price', `<span style="color:#10b981;font-weight:700;">${plotPrice}</span>`, true) +
        row('Plot Size', plotSize) +
        row('Property ID', `<span style="font-family:monospace;font-size:13px;">${plotId}</span>`, true)
      )}
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;text-align:center;margin-top:22px;">
        <p style="margin:0;font-size:14px;color:#15803d;font-weight:600;">
          Action Required: Reply to <a href="mailto:${userEmail}" style="color:#166534;">${userEmail}</a>
        </p>
      </div>
    `),
    replyTo: userEmail,
  };
}

function buildContactEmail(body) {
  const { userEmail, userName, userPhone, message } = body;
  return {
    subject: `📩 New Contact Form Submission from ${userName}`,
    html: wrap(`
      <p style="font-size:15px;line-height:1.6;color:#334155;margin-bottom:18px;">
        Hello Admin,<br/><br/>
        Someone has submitted the <strong>Contact Agent</strong> form on A1Plot.
      </p>
      ${table(
        row('Name', userName, true) +
        row('Email', `<a href="mailto:${userEmail}" style="color:#3b7a76;font-weight:600;">${userEmail}</a>`) +
        row('Phone', userPhone || 'Not provided', true) +
        row('Message', `<span style="white-space:pre-wrap;">${message || '(no message)'}</span>`)
      )}
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px;text-align:center;margin-top:22px;">
        <p style="margin:0;font-size:14px;color:#1d4ed8;font-weight:600;">
          Reply to this person at <a href="mailto:${userEmail}" style="color:#1e40af;">${userEmail}</a>
        </p>
      </div>
    `),
    replyTo: userEmail,
  };
}

function buildBuyRequestEmail(body) {
  const { userEmail, userName, plotId, plotTitle, plotLocation, plotPrice, plotSize, requestedDocs, specificQuery } = body;
  return {
    subject: `📋 Document Request for: ${plotTitle}`,
    html: wrap(`
      <p style="font-size:15px;line-height:1.6;color:#334155;margin-bottom:18px;">
        Hello Admin,<br/><br/>
        A buyer has submitted a <strong>document request</strong> for a property on A1Plot.
      </p>
      ${table(
        row('Buyer Name', userName, true) +
        row('Buyer Email', `<a href="mailto:${userEmail}" style="color:#3b7a76;font-weight:600;">${userEmail}</a>`) +
        row('Property Title', `<strong>${plotTitle}</strong>`, true) +
        row('Location', plotLocation) +
        row('Price', `<span style="color:#10b981;font-weight:700;">${plotPrice}</span>`, true) +
        row('Plot Size', plotSize) +
        row('Property ID', `<span style="font-family:monospace;font-size:13px;">${plotId}</span>`, true) +
        row('Documents Requested', requestedDocs) +
        row('Specific Query', `<span style="white-space:pre-wrap;">${specificQuery || 'None'}</span>`, true)
      )}
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:14px;text-align:center;margin-top:22px;">
        <p style="margin:0;font-size:14px;color:#92400e;font-weight:600;">
          Please prepare the requested documents and contact <a href="mailto:${userEmail}" style="color:#92400e;">${userEmail}</a>
        </p>
      </div>
    `),
    replyTo: userEmail,
  };
}

function buildBrokerRegisterEmail(body) {
  const { userName, userEmail, userPhone, agency, cities, experience, reraId } = body;
  return {
    subject: `🤝 New Broker Registration: ${userName}`,
    html: wrap(`
      <p style="font-size:15px;line-height:1.6;color:#334155;margin-bottom:18px;">
        Hello Admin,<br/><br/>
        A new <strong>broker has registered</strong> on A1Plot.
      </p>
      ${table(
        row('Broker Name', userName, true) +
        row('Email', `<a href="mailto:${userEmail}" style="color:#3b7a76;font-weight:600;">${userEmail}</a>`) +
        row('Phone', userPhone || 'Not provided', true) +
        row('Agency', agency || 'Independent') +
        row('Cities Covered', `<strong>${cities || '—'}</strong>`, true) +
        row('Experience', experience || 'Not provided', true) +
        row('RERA ID', reraId || 'Not provided')
      )}
    `),
    replyTo: userEmail,
  };
}

function buildNewRequirementEmail(body) {
  const { userName, userEmail, userPhone, city, propertyType, transactionType, budget, details } = body;
  return {
    subject: `🔔 New Buyer Requirement in ${city}`,
    html: wrap(`
      <p style="font-size:15px;line-height:1.6;color:#334155;margin-bottom:18px;">
        Hello Admin,<br/><br/>
        A buyer has <strong>posted a new requirement</strong> on A1Plot. Brokers covering ${city} can see this on their dashboard.
      </p>
      ${table(
        row('Buyer Name', userName, true) +
        row('Email', `<a href="mailto:${userEmail}" style="color:#3b7a76;font-weight:600;">${userEmail}</a>`) +
        row('Phone', userPhone || 'Not provided', true) +
        row('City', `<strong>${city}</strong>`) +
        row('Property Type', propertyType, true) +
        row('Looking To', transactionType === 'rent' ? 'Rent' : 'Buy') +
        row('Budget', `<span style="color:#10b981;font-weight:700;">${budget || 'Not specified'}</span>`, true) +
        row('Details', `<span style="white-space:pre-wrap;">${details || 'None'}</span>`)
      )}
    `),
    replyTo: userEmail,
  };
}

function buildBrokerContactEmail(body) {
  const { brokerName, brokerEmail, brokerPhone, agency, buyerName, buyerEmail, buyerPhone, city, propertyType, budget } = body;
  return {
    subject: `📞 Broker ${brokerName} is contacting a buyer in ${city}`,
    html: wrap(`
      <p style="font-size:15px;line-height:1.6;color:#334155;margin-bottom:18px;">
        Hello Admin,<br/><br/>
        A <strong>broker has connected with a buyer</strong> via A1Plot.
      </p>
      ${table(
        row('Broker', `${brokerName}${agency ? ' — ' + agency : ''}`, true) +
        row('Broker Contact', `${brokerPhone || ''} ${brokerEmail ? '· ' + brokerEmail : ''}`) +
        row('Buyer', buyerName, true) +
        row('Buyer Contact', `${buyerPhone || ''} ${buyerEmail ? '· ' + buyerEmail : ''}`) +
        row('City', city, true) +
        row('Property Type', propertyType) +
        row('Budget', `<span style="color:#10b981;font-weight:700;">${budget || 'Not specified'}</span>`, true)
      )}
    `),
    replyTo: brokerEmail,
  };
}

// ── Main handler ─────────────────────────────────────────────────────────────
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400, headers: CORS_HEADERS });
  }

  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || 'ykandoi20330@gmail.com';
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  // Determine email content based on form type
  const formType = body.formType || 'interest'; // default for backward-compat
  let emailContent;
  if (formType === 'contact') {
    emailContent = buildContactEmail(body);
  } else if (formType === 'buyRequest') {
    emailContent = buildBuyRequestEmail(body);
  } else if (formType === 'brokerRegister') {
    emailContent = buildBrokerRegisterEmail(body);
  } else if (formType === 'newRequirement') {
    emailContent = buildNewRequirementEmail(body);
  } else if (formType === 'brokerContact') {
    emailContent = buildBrokerContactEmail(body);
  } else {
    emailContent = buildInterestEmail(body);
  }

  // Mock mode when SMTP not configured
  if (!smtpUser || !smtpPass) {
    console.log('── SMTP NOT CONFIGURED ── Mock email:');
    console.log('To:', adminEmail, '| Subject:', emailContent.subject);
    return Response.json(
      { success: true, mock: true, info: 'Set SMTP_USER and SMTP_PASS in env to send real emails.' },
      { status: 200, headers: CORS_HEADERS }
    );
  }

  try {
    const transporterConfig = smtpUser.includes('gmail')
      ? { service: 'gmail', auth: { user: smtpUser, pass: smtpPass } }
      : {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: parseInt(process.env.SMTP_PORT || '587') === 465,
          auth: { user: smtpUser, pass: smtpPass },
        };

    const transporter = nodemailer.createTransport(transporterConfig);
    const info = await transporter.sendMail({
      from: `"A1Plot Notifications" <${smtpUser}>`,
      to: adminEmail,
      replyTo: emailContent.replyTo,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log('✅ Email sent:', info.messageId);
    return Response.json({ success: true, messageId: info.messageId }, { status: 200, headers: CORS_HEADERS });
  } catch (error) {
    console.error('❌ Email error:', error);
    return Response.json({ error: 'Failed to send email', details: error.message }, { status: 500, headers: CORS_HEADERS });
  }
}

