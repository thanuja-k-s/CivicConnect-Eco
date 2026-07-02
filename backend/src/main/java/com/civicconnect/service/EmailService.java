package com.civicconnect.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Email Service with Gmail SMTP + automatic console-log fallback.
 * Set spring.mail.username in application.properties to enable real sending.
 * Leave it blank to use console-logging mode (development default).
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    private boolean isMailConfigured() {
        return mailSender != null && fromEmail != null && !fromEmail.isBlank();
    }

    public void sendEmail(String to, String subject, String htmlBody) {
        if (!isMailConfigured()) {
            log.info("─────────────────────────────────────────────────────────");
            log.info("[EMAIL-STUB] To: {}", to);
            log.info("[EMAIL-STUB] Subject: {}", subject);
            log.info("[EMAIL-STUB] Body: {}", htmlBody);
            log.info("─────────────────────────────────────────────────────────");
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("[EMAIL] Sent to {} — Subject: {}", to, subject);
        } catch (Exception e) {
            log.error("[EMAIL] Failed to send to {}: {}", to, e.getMessage());
        }
    }

    public void sendEventNotification(String to, String recipientName, String eventTitle,
                                       String eventDate, String eventTime, String location,
                                       int rewardPoints, Long eventId) {
        String subject = "🌿 New Environmental Event Near You: " + eventTitle;
        String body = buildEventNotificationHtml(recipientName, eventTitle, eventDate,
                                                  eventTime, location, rewardPoints, eventId);
        sendEmail(to, subject, body);
    }

    public void sendNgoApprovalEmail(String to, String ngoName) {
        String subject = "✅ CivicConnect Eco – NGO Registration Approved";
        String body = "<html><body style='font-family:sans-serif;'>" +
            "<h2 style='color:#16a34a;'>Congratulations! 🎉</h2>" +
            "<p>Your NGO <strong>" + ngoName + "</strong> has been approved on CivicConnect Eco.</p>" +
            "<p>You can now log in and start creating environmental events, track volunteers, and make an impact.</p>" +
            "<p style='color:#6b7280;font-size:12px;'>– CivicConnect Eco Team</p>" +
            "</body></html>";
        sendEmail(to, subject, body);
    }

    public void sendNgoRejectionEmail(String to, String ngoName, String reason) {
        String subject = "❌ CivicConnect Eco – NGO Registration Update";
        String body = "<html><body style='font-family:sans-serif;'>" +
            "<h2 style='color:#dc2626;'>Registration Not Approved</h2>" +
            "<p>Unfortunately, your NGO <strong>" + ngoName + "</strong> was not approved.</p>" +
            "<p><strong>Reason:</strong> " + (reason != null ? reason : "Does not meet registration requirements") + "</p>" +
            "<p>You may re-apply after addressing the issues. Contact support for more details.</p>" +
            "<p style='color:#6b7280;font-size:12px;'>– CivicConnect Eco Team</p>" +
            "</body></html>";
        sendEmail(to, subject, body);
    }

    public void sendNgoHotspotAlert(String to, String ngoName, String category, String area, int complaintCount) {
        String subject = "🚨 High " + category + " Complaints Detected in Your Area";
        String body = "<html><body style='font-family:sans-serif;'>" +
            "<h2 style='color:#d97706;'>Environmental Hotspot Detected 🚨</h2>" +
            "<p>Dear <strong>" + ngoName + "</strong>,</p>" +
            "<p>Our AI system has detected a high concentration of <strong>" + category +
            "</strong> complaints (" + complaintCount + " reports) in <strong>" + area + "</strong>.</p>" +
            "<h3>Would you like to organize a Community Cleanup Drive?</h3>" +
            "<p>Log in to CivicConnect Eco to create an event and coordinate volunteers.</p>" +
            "<p style='color:#6b7280;font-size:12px;'>– CivicConnect Eco AI Recommendation Engine</p>" +
            "</body></html>";
        sendEmail(to, subject, body);
    }

    public void sendBadgeAwardEmail(String to, String userName, String badgeName, String badgeIcon) {
        String subject = "🏆 New Badge Unlocked: " + badgeName;
        String body = "<html><body style='font-family:sans-serif;text-align:center;'>" +
            "<h2 style='color:#16a34a;'>" + badgeIcon + " Badge Unlocked!</h2>" +
            "<p>Congratulations <strong>" + userName + "</strong>!</p>" +
            "<p>You've earned the <strong>" + badgeName + "</strong> badge on CivicConnect Eco.</p>" +
            "<p>Keep up the great environmental work!</p>" +
            "<p style='color:#6b7280;font-size:12px;'>– CivicConnect Eco Team</p>" +
            "</body></html>";
        sendEmail(to, subject, body);
    }

    private String buildEventNotificationHtml(String name, String title, String date,
                                               String time, String location, int points, Long eventId) {
        return "<html><body style='font-family:sans-serif;'>" +
            "<div style='max-width:600px;margin:0 auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;'>" +
            "<div style='background:#16a34a;padding:20px;text-align:center;'>" +
            "<h1 style='color:white;margin:0;'>🌿 CivicConnect Eco</h1></div>" +
            "<div style='padding:24px;'>" +
            "<p>Dear <strong>" + name + "</strong>,</p>" +
            "<p>A new environmental event has been organized near your location!</p>" +
            "<div style='background:#f0fdf4;border-left:4px solid #16a34a;padding:16px;border-radius:4px;margin:16px 0;'>" +
            "<h2 style='margin:0 0 8px;color:#15803d;'>" + title + "</h2>" +
            "<p style='margin:4px 0;'>📅 <strong>Date:</strong> " + date + "</p>" +
            "<p style='margin:4px 0;'>⏰ <strong>Time:</strong> " + time + "</p>" +
            "<p style='margin:4px 0;'>📍 <strong>Location:</strong> " + location + "</p>" +
            "<p style='margin:4px 0;'>🌟 <strong>Reward:</strong> " + points + " Eco Points</p>" +
            "</div>" +
            "<p>Join this event to earn Eco Points, unlock badges, and appear on the leaderboard!</p>" +
            "</div>" +
            "<div style='background:#f9fafb;padding:12px;text-align:center;font-size:12px;color:#6b7280;'>" +
            "CivicConnect Eco – Citizen Government NGO Ecosystem</div>" +
            "</div></body></html>";
    }
}
