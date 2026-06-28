import nodemailer from "nodemailer";
import logger from "../utils/logger.js";
import NOTIFICATION_TYPES from "../constants/notification-types.js";

//create an smtp connection
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || 'HMS System <no-reply@hospital.com>',
    to,
    subject,
    html,
    text,
  };

  const info = await transporter.sendMail(mailOptions); //sending the email
  logger.info('Email sent:', { messageId: info.messageId, to });
  return info;
};

const buildAppointmentBookedEmail = (payload) => ({
  subject: 'Appointment Confirmation - Hospital Management System',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Appointment Confirmed</h2>
      <p>Dear ${payload.patientName},</p>
      <p>Your appointment has been successfully booked.</p>
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Doctor</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.doctorName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Date</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.appointmentDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Time</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.slotTime}</td>
        </tr>
      </table>
      <p>Please arrive 10 minutes before your scheduled time.</p>
      <p style="color: #6b7280; font-size: 12px;">This is an automated message from the Hospital Management System.</p>
    </div>
  `,
  text: `Appointment Confirmed\n\nDear ${payload.patientName},\n\nYour appointment has been booked.\nDoctor: ${payload.doctorName}\nDate: ${payload.appointmentDate}\nTime: ${payload.slotTime}\n\nPlease arrive 10 minutes before your scheduled time.`,
});

const buildAppointmentCancelledEmail = (payload) => ({
  subject: 'Appointment Cancellation Notice - Hospital Management System',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Appointment Cancelled</h2>
      <p>Your appointment (ID: ${payload.appointmentId}) has been cancelled.</p>
      <p>If you have questions, please contact the hospital reception.</p>
      <p style="color: #6b7280; font-size: 12px;">This is an automated message from the Hospital Management System.</p>
    </div>
  `,
  text: `Appointment Cancelled\n\nYour appointment (ID: ${payload.appointmentId}) has been cancelled.\n\nIf you have questions, please contact the hospital reception.`,
});

const buildAppointmentRescheduledEmail = (payload) => ({
  subject: 'Appointment Rescheduled - Hospital Management System',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #d97706;">Appointment Rescheduled</h2>
      <p>Your appointment has been rescheduled.</p>
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Doctor</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.doctorName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">New Date</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.appointmentDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">New Time</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${payload.slotTime}</td>
        </tr>
      </table>
      <p style="color: #6b7280; font-size: 12px;">This is an automated message from the Hospital Management System.</p>
    </div>
  `,
  text: `Appointment Rescheduled\n\nYour appointment has been rescheduled.\nDoctor: ${payload.doctorName}\nNew Date: ${payload.appointmentDate}\nNew Time: ${payload.slotTime}`,
});

const buildPasswordResetEmail = (payload) => ({
  subject: 'Password Reset Request - Hospital Management System',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Password Reset</h2>
      <p>Dear ${payload.recipientName},</p>
      <p>A password reset was requested for your account.</p>
      <p>Your reset token (valid for 1 hour):</p>
      <div style="background: #f3f4f6; padding: 12px; border-radius: 4px; word-break: break-all; font-family: monospace;">
        ${payload.resetToken}
      </div>
      <p>If you did not request this, please ignore this email.</p>
      <p style="color: #6b7280; font-size: 12px;">This is an automated message from the Hospital Management System.</p>
    </div>
  `,
  text: `Password Reset\n\nDear ${payload.recipientName},\n\nYour reset token (valid for 1 hour):\n${payload.resetToken}\n\nIf you did not request this, please ignore this email.`,
});

const processNotification = async (type, payload) => {
  let emailContent;
  let recipientEmail = payload.recipientEmail || payload.patientEmail;

  switch (type) {
    case NOTIFICATION_TYPES.APPOINTMENT_BOOKED:
      emailContent = buildAppointmentBookedEmail(payload);
      break;
    case NOTIFICATION_TYPES.APPOINTMENT_CANCELLED:
      emailContent = buildAppointmentCancelledEmail(payload);
      break;
    case NOTIFICATION_TYPES.APPOINTMENT_RESCHEDULED:
      emailContent = buildAppointmentRescheduledEmail(payload);
      break;
    case NOTIFICATION_TYPES.PASSWORD_RESET:
      recipientEmail = payload.recipientEmail;
      emailContent = buildPasswordResetEmail(payload);
      break;
    default:
      logger.warn('Unknown notification type:', type);
      return;
  }

  if (!recipientEmail) {
    logger.warn('No recipient email for notification type:', type);
    return;
  }

  await sendEmail({ to: recipientEmail, ...emailContent });
};

export default  processNotification ;



// Notification Worker
//         │
//         ▼
// processNotification(type, payload)
//         │
//         ▼
// Switch on Notification Type
//         │
//         ├────────► Appointment Booked
//         │              │
//         │              ▼
//         │     buildAppointmentBookedEmail()
//         │
//         ├────────► Appointment Cancelled
//         │              │
//         │              ▼
//         │     buildAppointmentCancelledEmail()
//         │
//         ├────────► Appointment Rescheduled
//         │              │
//         │              ▼
//         │     buildAppointmentRescheduledEmail()
//         │
//         └────────► Password Reset
//                        │
//                        ▼
//               buildPasswordResetEmail()
//                        │
//                        ▼
//           { subject, html, text }
//                        │
//                        ▼
//                sendEmail()
//                        │
//                        ▼
//              createTransporter()
//                        │
//                        ▼
//           transporter.sendMail()
//                        │
//                        ▼
//                  SMTP Server
//                        │
//                        ▼
//               Recipient's Inbox