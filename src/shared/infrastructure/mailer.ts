import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';
import 'dotenv/config'; 
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const testMailer = async () => {
  try {
    await transporter.verify();
    logger.info('SMTP server is ready to take our messages');
  } catch (err) {
    logger.error('Error connecting to SMTP server:', err);
  }
}

testMailer();


export class EmailError extends Error {
  code: string;
  command?: string;
  response?: string;
  responseCode?: number;
  rejected?: string[];

  constructor(
    message: string,
    code: string,
    options?: {
      command?: string;
      response?: string;
      responseCode?: number;
      rejected?: string[];
    },
  ) {
    super(message);
    this.name = 'EmailError';
    this.code = code;
    this.command = options?.command;
    this.response = options?.response;
    this.responseCode = options?.responseCode;
    this.rejected = options?.rejected;
  }
}

export const sendStatusNotificationEmail = async (to: string, subject: string, text: string) => {
  try {
    const info = await transporter.sendMail({
      from: `${process.env.SMTP_USER}`, 
      to: `${to}`,
      subject: `${subject}`,
      text: `${text}`,
    });
    logger.info('Message sent:', info.messageId);

    if (info.rejected.length > 0) {
      logger.warn('Some recipients were rejected:', info.rejected);
    }
  } catch (err: unknown) {
    if (err instanceof EmailError) {
      switch (err.code) {
        case 'ECONNECTION':
        case 'ETIMEDOUT':
          logger.error('Network error - retry later:', err.message);
          break;
        case 'EAUTH':
          logger.error('Authentication failed:', err.message);
          break;
        case 'EENVELOPE':
          logger.error('Invalid recipients:', err.rejected);
          break;
        default:
          logger.error('Send failed:', err.message);
      }
    } else {
      logger.error('An unknown error occurred:', err);
    }
  }
};
