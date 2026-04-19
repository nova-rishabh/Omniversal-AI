import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env.local
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function testEmail() {
  console.log('Testing Nodemailer Authentication...');
  console.log('User:', process.env.GMAIL_USER);
  
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('ERROR: Missing GMAIL_USER or GMAIL_APP_PASSWORD in .env.local');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ Authentication successful! Nodemailer can connect to Gmail.');
    
    // Optional: actually send a test email to yourself
    console.log('Attempting to send a test email to ' + process.env.GMAIL_USER);
    await transporter.sendMail({
      from: `"Omniversal Test" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: "Test Email from Omniversal",
      text: "If you are reading this, Gmail SMTP is working!",
    });
    console.log('✅ Test email sent!');
    
  } catch (error) {
    console.error('❌ Authentication failed:', error);
  }
}

testEmail();
