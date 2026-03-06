import { Resend } from 'resend';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

let resend: Resend | null = null;
if (config.RESEND_API_KEY) {
    resend = new Resend(config.RESEND_API_KEY);
} else {
    logger.warn('RESEND_API_KEY not found in environment. Email service will be disabled.');
}

const FROM_EMAIL = 'VidCraft <notifications@vidcraft.ai>'; // Replace with your verified Resend domain if needed

export async function sendGenerationCompleteEmail(to: string, videoUrl: string, model: string) {
    if (!resend) {
        logger.info('Skipping email send: Resend is not configured', { to, videoUrl });
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject: '🎬 Your VidCraft Video is Ready!',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #f59e0b;">Your Video has Finished Generating!</h2>
          <p>Great news! The video you requested using the <strong>${model}</strong> model is now complete and ready to view.</p>
          <div style="margin: 30px 0;">
            <a href="${videoUrl}" style="background-color: #f59e0b; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Your Video
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${videoUrl}" style="color: #f59e0b;">${videoUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            You can update your email preferences in your VidCraft Settings page.
          </p>
        </div>
      `,
        });

        if (error) {
            logger.error('Resend API returned an error', { to, error });
        } else {
            logger.info('Generation complete email sent successfully', { to, emailId: data?.id });
        }
    } catch (error) {
        logger.error('Failed to send generation complete email', { to, error });
    }
}
