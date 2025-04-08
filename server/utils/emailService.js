const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const emailValidator = require('email-validator');

// Define the logo path
const logoPath = path.join(__dirname, '..', 'assets', 'Gumizz_logo.png');
console.log('Logo path:', logoPath);

// Verify the logo exists
let logoExists = false;
try {
  logoExists = fs.existsSync(logoPath);
  console.log('Logo exists:', logoExists);
} catch (error) {
  console.error('Error checking if logo exists:', error);
}

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Function to send registration confirmation email
exports.sendRegistrationEmail = async (user) => {
  try {
    // Validate email first
    if (!emailValidator.validate(user.email)) {
      throw new Error(`Invalid email address: ${user.email}`);
    }

    // Create plain text version for better deliverability
    const textVersion = `
      Üdvözöljük a Gumizz Kft. oldalán!
      
      Kedves ${user.first_name} ${user.last_name},
      
      Köszönjük, hogy regisztrált oldalunkon! Fiókja sikeresen létrejött.
      
      Felhasználói adatok:
      - Név: ${user.first_name} ${user.last_name}
      - Email: ${user.email}
      
      Most már bejelentkezhet és böngészhet termékeink és szolgáltatásaink között.
      
      Ha bármilyen kérdése van, kérjük, vegye fel velünk a kapcsolatot.
      
      © 2025 Gumizz Kft. Minden jog fenntartva.
    `;

    const mailOptions = {
      from: `"Gumizz Webáruház" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Sikeres regisztráció - Gumizz Kft.',
      text: textVersion,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High'
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            ${logoExists ? '<img src="cid:logo" alt="Gumizz Kft. Logo" style="max-width: 150px;">' : '<h1 style="color: #4e77f4;">Gumizz Kft.</h1>'}
          </div>
          <h2 style="color: #4e77f4;">Üdvözöljük a Gumizz Kft. oldalán!</h2>
          <p>Kedves ${user.first_name} ${user.last_name},</p>
          <p>Köszönjük, hogy regisztrált oldalunkon! Fiókja sikeresen létrejött.</p>
          <p>Felhasználói adatok:</p>
          <ul>
            <li>Név: ${user.first_name} ${user.last_name}</li>
            <li>Email: ${user.email}</li>
          </ul>
          <p>Most már bejelentkezhet és böngészhet termékeink és szolgáltatásaink között.</p>
          <p>Ha bármilyen kérdése van, kérjük, vegye fel velünk a kapcsolatot.</p>
          <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
            Kérdéseivel forduljon ügyfélszolgálatunkhoz a következő elérhetőségeken:
            Email: info.gumizzwebaruhaz@gmail.com
            Telefon: +36 30 393 0594 / +36 20 443 5228
            
            © 2025 Gumizz Kft. Minden jog fenntartva.
          </p>
        </div>
      `,
      attachments: logoExists ? [
        {
          filename: 'Gumizz_logo.png',
          path: logoPath,
          cid: 'logo' // Content ID referenced in the HTML
        }
      ] : []
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Registration email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending registration email:', error);
    throw error;
  }
};

// Function to send order confirmation email
exports.sendOrderConfirmationEmail = async (user, order, orderItems, hasAppointment, appointmentDetails) => {
  try {
    // Validate email first
    if (!emailValidator.validate(user.email)) {
      throw new Error(`Invalid email address: ${user.email}`);
    }

    // Format items for email - UPDATED to show product name
    const itemsList = orderItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">
          ${item.product_type === 'service' ? 'Szolgáltatás' : 'Termék'}: 
          <strong>${item.product_name || `ID: ${item.product_id}`}</strong>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${item.quantity} db</td>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${new Intl.NumberFormat('hu-HU').format(item.unit_price)} Ft</td>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${new Intl.NumberFormat('hu-HU').format(item.unit_price * item.quantity)} Ft</td>
      </tr>
    `).join('');

    // Appointment section
    let appointmentSection = '';
    if (hasAppointment && appointmentDetails) {
      appointmentSection = `
        <div style="margin-top: 30px; padding: 15px; background-color: #f0f4ff; border-radius: 5px;">
          <h3 style="color: #4e77f4; margin-top: 0;">Időpontfoglalás részletei</h3>
          <p><strong>Dátum:</strong> ${new Date(appointmentDetails.appointment_time).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong>Időpont:</strong> ${new Date(appointmentDetails.appointment_time).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}</p>
          <p><strong>Helyszín:</strong> ${appointmentDetails.garage_name}</p>
        </div>
      `;
    }

    // Create plain text version for better deliverability
    const textVersion = `
      Köszönjük a rendelését!
      
      Kedves ${user.last_name} ${user.first_name},
      
      Rendelését sikeresen rögzítettük. Az alábbiakban találja a rendelés részleteit:
      
      Rendelésszám: #${order.id}
      Rendelés dátuma: ${new Date(order.createdAt).toLocaleDateString('hu-HU')}
      Állapot: Feldolgozás alatt
      Végösszeg: ${new Intl.NumberFormat('hu-HU').format(order.total_price)} Ft
      
      ${hasAppointment && appointmentDetails ? `
      Időpontfoglalás részletei:
      Dátum: ${new Date(appointmentDetails.appointment_time).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}
      Időpont: ${new Date(appointmentDetails.appointment_time).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
      Helyszín: ${appointmentDetails.garage_name}
      ` : ''}
      
      Rendelésével kapcsolatos kérdéseivel forduljon ügyfélszolgálatunkhoz a következő elérhetőségeken:
      Email: info.gumizzwebaruhaz@gmail.com
      Telefon: +36 30 393 0594 / +36 20 443 5228
      
      © 2025 Gumizz Kft. Minden jog fenntartva.
    `;

    const mailOptions = {
      from: `"Gumizz Webáruház" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Rendelés visszaigazolás - #${order.id}`,
      text: textVersion,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High'
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            ${logoExists ? '<img src="cid:logo" alt="Gumizz Kft. Logo" style="max-width: 150px;">' : '<h1 style="color: #4e77f4;">Gumizz Kft.</h1>'}
          </div>
          <h2 style="color: #4e77f4;">Köszönjük a rendelését!</h2>
          <p>Kedves ${user.last_name} ${user.first_name},</p>
          <p>Rendelését sikeresen rögzítettük. Az alábbiakban találja a rendelés részleteit:</p>
          
          <div style="margin: 20px 0; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
            <p><strong>Rendelésszám:</strong> #${order.id}</p>
            <p><strong>Rendelés dátuma:</strong> ${new Date(order.createdAt).toLocaleDateString('hu-HU')}</p>
            <p><strong>Állapot:</strong> Feldolgozás alatt</p>
          </div>
          
          <h3 style="color: #4e77f4;">Rendelt tételek</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f0f4ff;">
                <th style="padding: 10px; text-align: left;">Tétel</th>
                <th style="padding: 10px; text-align: left;">Mennyiség</th>
                <th style="padding: 10px; text-align: left;">Egységár</th>
                <th style="padding: 10px; text-align: left;">Összesen</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;"><strong>Végösszeg:</strong></td>
                <td style="padding: 10px;"><strong>${new Intl.NumberFormat('hu-HU').format(order.total_price)} Ft</strong></td>
              </tr>
            </tfoot>
          </table>
          
          ${appointmentSection}
          
          <p style="margin-top: 30px;">Rendelésével kapcsolatos kérdéseivel forduljon ügyfélszolgálatunkhoz a következő elérhetőségeken:</p>
          <p>Email: info.gumizzwebaruhaz@gmail.com<br>Telefon: +36 30 393 0594 / +36 20 443 5228</p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
            © 2025 Gumizz Kft. Minden jog fenntartva.
          </p>
        </div>
      `,
      attachments: logoExists ? [
        {
          filename: 'Gumizz_logo.png',
          path: logoPath,
          cid: 'logo' // Content ID referenced in the HTML
        }
      ] : []
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

// Send order status update email
exports.sendOrderStatusUpdateEmail = async (user, order, garage, statusInfo) => {
  try {
    // Validate email first
    if (!emailValidator.validate(user.email)) {
      throw new Error(`Invalid email address: ${user.email}`);
    }

    // Get status-specific content
    let statusTitle, statusMessage, statusColor, statusEmoji;

    switch (order.status) {
      case 'confirmed':
        statusTitle = 'Rendelés megerősítve';
        statusMessage = 'Rendelését megerősítettük és feldolgozás alatt áll. Hamarosan elkészítjük és értesítjük a további teendőkről.';
        statusColor = '#4e77f4'; // Blue
        statusEmoji = '✅';
        break;
      case 'completed':
        statusTitle = 'Rendelés teljesítve';
        statusMessage = 'Rendelését sikeresen teljesítettük. Köszönjük, hogy a Gumizz Kft. szolgáltatásait választotta!';
        statusColor = '#10b981'; // Green
        statusEmoji = '🎉';
        break;
      case 'canceled':
        statusTitle = 'Rendelés törölve';
        statusMessage = 'Rendelését törölték. Ha kérdése van ezzel kapcsolatban, kérjük, vegye fel a kapcsolatot ügyfélszolgálatunkkal.';
        statusColor = '#ef4444'; // Red
        statusEmoji = '❌';
        break;
      default:
        statusTitle = 'Rendelés állapota frissítve';
        statusMessage = `Rendelésének állapota megváltozott: ${order.status}`;
        statusColor = '#4e77f4';
        statusEmoji = 'ℹ️';
    }

    // Create plain text version for better deliverability
    const textVersion = `
      ${statusTitle}
      
      Kedves ${user.last_name} ${user.first_name},
      
      ${statusMessage}
      
      Rendelésszám: #${order.id}
      Rendelés dátuma: ${new Date(order.createdAt).toLocaleDateString('hu-HU')}
      Szerviz: ${garage?.name || 'Nem elérhető'}
      Végösszeg: ${new Intl.NumberFormat('hu-HU').format(order.total_price)} Ft
      
      Rendelésével kapcsolatos kérdéseivel forduljon ügyfélszolgálatunkhoz a következő elérhetőségeken:
      Email: info.gumizzwebaruhaz@gmail.com
      Telefon: +36 30 393 0594 / +36 20 443 5228
      
      © 2025 Gumizz Kft. Minden jog fenntartva.
    `;

    const mailOptions = {
      from: `"Gumizz Webáruház" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `${statusEmoji} ${statusTitle} - Rendelés #${order.id}`,
      text: textVersion,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High'
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            ${logoExists ? '<img src="cid:logo" alt="Gumizz Kft. Logo" style="max-width: 150px;">' : '<h1 style="color: #4e77f4;">Gumizz Kft.</h1>'}
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; width: 80px; height: 80px; border-radius: 50%; background-color: ${statusColor}; color: white; font-size: 40px; line-height: 80px; text-align: center; margin-bottom: 15px;">
              ${statusEmoji}
            </div>
            <h2 style="color: ${statusColor}; margin: 0;">${statusTitle}</h2>
          </div>
          
          <p>Kedves ${user.last_name} ${user.first_name},</p>
          <p>${statusMessage}</p>
          
          <div style="margin: 25px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px; border-left: 4px solid ${statusColor};">
            <p style="margin: 0 0 10px 0;"><strong>Rendelésszám:</strong> #${order.id}</p>
            <p style="margin: 0 0 10px 0;"><strong>Rendelés dátuma:</strong> ${new Date(order.createdAt).toLocaleDateString('hu-HU')}</p>
            <p style="margin: 0 0 10px 0;"><strong>Szerviz:</strong> ${garage?.name || 'Nem elérhető'}</p>
            <p style="margin: 0;"><strong>Végösszeg:</strong> ${new Intl.NumberFormat('hu-HU').format(order.total_price)} Ft</p>
          </div>
          
          <p style="margin-top: 30px;">Rendelésével kapcsolatos kérdéseivel forduljon ügyfélszolgálatunkhoz a következő elérhetőségeken:</p>
          <p>Email: info.gumizzwebaruhaz@gmail.com<br>Telefon: +36 30 393 0594 / +36 20 443 5228</p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
            © 2025 Gumizz Kft. Minden jog fenntartva.
          </p>
        </div>
      `,
      attachments: logoExists ? [
        {
          filename: 'Gumizz_logo.png',
          path: logoPath,
          cid: 'logo' // Content ID referenced in the HTML
        }
      ] : []
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Order status update email sent (${order.status}):`, info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending order status update email:', error);
    throw error;
  }
};