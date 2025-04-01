const nodemailer = require('nodemailer');

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
    const mailOptions = {
      from: `"Gumizz Webáruház" <${process.env.EMAIL_USER}>`, // Add a display name
      to: user.email,
      subject: 'Sikeres regisztráció - Gumizz Kft.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://your-website.com/logo.png" alt="Gumizz Kft. Logo" style="max-width: 150px;">
          </div>
          <h2 style="color: #4e77f4;">Üdvözöljük a Gumizz Kft. oldalán!</h2>
          <p>Kedves ${user.name},</p>
          <p>Köszönjük, hogy regisztrált oldalunkon! Fiókja sikeresen létrejött.</p>
          <p>Felhasználói adatok:</p>
          <ul>
            <li>Név: ${user.name}</li>
            <li>Email: ${user.email}</li>
          </ul>
          <p>Most már bejelentkezhet és böngészhet termékeink és szolgáltatásaink között.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:5173/login" style="background-color: #4e77f4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Bejelentkezés</a>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
            © 2025 Gumizz Kft. Minden jog fenntartva.
          </p>
        </div>
      `
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
    // Format items for email
    const itemsList = orderItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${item.product_type === 'service' ? 'Szolgáltatás' : 'Termék'}</td>
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

    const mailOptions = {
      from: `"Gumizz Webáruház" <${process.env.EMAIL_USER}>`, // Add a display name
      to: user.email,
      subject: `Rendelés visszaigazolás - #${order.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://your-website.com/logo.png" alt="Gumizz Kft. Logo" style="max-width: 150px;">
          </div>
          <h2 style="color: #4e77f4;">Köszönjük a rendelését!</h2>
          <p>Kedves ${user.name},</p>
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
          <p>Email: info@gumizz.hu<br>Telefon: +36 1 234 5678</p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
            © 2025 Gumizz Kft. Minden jog fenntartva.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};
