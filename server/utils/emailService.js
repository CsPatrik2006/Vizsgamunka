const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const emailValidator = require('email-validator');

const logoPath = path.join(__dirname, '..', 'assets', 'Gumizz_logo.png');
console.log('Logo path:', logoPath);

let logoExists = false;
try {
  logoExists = fs.existsSync(logoPath);
  console.log('Logo exists:', logoExists);
} catch (error) {
  console.error('Error checking if logo exists:', error);
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

exports.sendRegistrationEmail = async (user) => {
  try {
    if (!emailValidator.validate(user.email)) {
      throw new Error(`Invalid email address: ${user.email}`);
    }

    const textVersion = `
      Üdvözöljük a Gumizz Kft. oldalán!
      
      Kedves ${user.last_name} ${user.first_name},
      
      Köszönjük, hogy regisztrált oldalunkon! Fiókja sikeresen létrejött.
      
      Felhasználói adatok:
      - Név: ${user.last_name} ${user.first_name}
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
          <p>Kedves ${user.last_name} ${user.first_name},</p>
          <p>Köszönjük, hogy regisztrált oldalunkon! Fiókja sikeresen létrejött.</p>
          <p>Felhasználói adatok:</p>
          <ul>
            <li>Név: ${user.last_name} ${user.first_name}</li>
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
          cid: 'logo'
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

exports.sendOrderConfirmationEmail = async (user, order, orderItems, hasAppointment, appointmentDetails) => {
  try {
    if (!emailValidator.validate(user.email)) {
      throw new Error(`Invalid email address: ${user.email}`);
    }

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
          cid: 'logo'
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

exports.sendOrderStatusUpdateEmail = async (user, order, garage, statusInfo) => {
  try {
    if (!emailValidator.validate(user.email)) {
      throw new Error(`Invalid email address: ${user.email}`);
    }

    let statusTitle, statusMessage, statusColor, statusEmoji;

    switch (order.status) {
      case 'confirmed':
        statusTitle = 'Rendelés megerősítve';
        statusMessage = 'Rendelését megerősítettük és feldolgozás alatt áll. Hamarosan elkészítjük és értesítjük a további teendőkről.';
        statusColor = '#4e77f4';
        statusEmoji = '✅';
        break;
      case 'completed':
        statusTitle = 'Rendelés teljesítve';
        statusMessage = 'Rendelését sikeresen teljesítettük. A terméke megérkezett az Ön által kiválasztott szervízbe. Köszönjük, hogy a Gumizz Kft. szolgáltatásait választotta!';
        statusColor = '#10b981';
        statusEmoji = '🎉';
        break;
      case 'canceled':
        statusTitle = 'Rendelés törölve';
        statusMessage = 'Rendelését törölték. Ha kérdése van ezzel kapcsolatban, kérjük, vegye fel a kapcsolatot ügyfélszolgálatunkkal.';
        statusColor = '#ef4444';
        statusEmoji = '❌';
        break;
      default:
        statusTitle = 'Rendelés állapota frissítve';
        statusMessage = `Rendelésének állapota megváltozott: ${order.status}`;
        statusColor = '#4e77f4';
        statusEmoji = 'ℹ️';
    }

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
          cid: 'logo'
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

exports.sendAppointmentConfirmationEmail = async (user, appointment, garage, scheduleSlot) => {
  try {
    if (!emailValidator.validate(user.email)) {
      throw new Error(`Invalid email address: ${user.email}`);
    }

    const appointmentDate = new Date(appointment.appointment_time);
    const formattedDate = appointmentDate.toLocaleDateString('hu-HU', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const formattedTime = appointmentDate.toLocaleTimeString('hu-HU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const textVersion = `
      Időpontfoglalás megerősítve
      
      Kedves ${user.last_name} ${user.first_name},
      
      Az Ön által kért időpontot megerősítettük. Várjuk Önt a megadott időpontban!
      
      Időpontfoglalás részletei:
      Azonosító: #${appointment.id}
      Dátum: ${formattedDate}
      Időpont: ${formattedTime}
      Helyszín: ${garage?.name || 'Nem elérhető'}
      Cím: ${garage?.location || 'Nem elérhető'}
      
      Időpontfoglalásával kapcsolatos kérdéseivel forduljon ügyfélszolgálatunkhoz a következő elérhetőségeken:
      Email: info.gumizzwebaruhaz@gmail.com
      Telefon: +36 30 393 0594 / +36 20 443 5228
      
      © 2025 Gumizz Kft. Minden jog fenntartva.
    `;

    const mailOptions = {
      from: `"Gumizz Webáruház" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `✅ Időpontfoglalás megerősítve - #${appointment.id}`,
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
            <div style="display: inline-block; width: 80px; height: 80px; border-radius: 50%; background-color: #4e77f4; color: white; font-size: 40px; line-height: 80px; text-align: center; margin-bottom: 15px;">
              ✅
            </div>
            <h2 style="color: #4e77f4; margin: 0;">Időpontfoglalás megerősítve</h2>
          </div>
          
          <p>Kedves ${user.last_name} ${user.first_name},</p>
          <p>Az Ön által kért időpontot megerősítettük. Várjuk Önt a megadott időpontban!</p>
          
          <div style="margin: 25px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px; border-left: 4px solid #4e77f4;">
            <h3 style="color: #4e77f4; margin-top: 0;">Időpontfoglalás részletei</h3>
            <p style="margin: 0 0 10px 0;"><strong>Azonosító:</strong> #${appointment.id}</p>
            <p style="margin: 0 0 10px 0;"><strong>Dátum:</strong> ${formattedDate}</p>
            <p style="margin: 0 0 10px 0;"><strong>Időpont:</strong> ${formattedTime}</p>
            <p style="margin: 0 0 10px 0;"><strong>Helyszín:</strong> ${garage?.name || 'Nem elérhető'}</p>
            <p style="margin: 0;"><strong>Cím:</strong> ${garage?.location || 'Nem elérhető'}</p>
            ${scheduleSlot ? `
            <p style="margin: 10px 0 0 0;"><strong>Időablak:</strong> ${scheduleSlot.day_of_week}, ${scheduleSlot.start_time} - ${scheduleSlot.end_time}</p>
            ` : ''}
          </div>
          
          <p style="margin-top: 30px;">Időpontfoglalásával kapcsolatos kérdéseivel forduljon ügyfélszolgálatunkhoz a következő elérhetőségeken:</p>
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
          cid: 'logo'
        }
      ] : []
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Appointment confirmation email sent:`, info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
    throw error;
  }
};