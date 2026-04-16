package com.sliit.smartcampus.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

  private static final Logger log = LoggerFactory.getLogger(EmailService.class);
  private final JavaMailSender mailSender;

  private static final String TEAL = "#0f766e";
  private static final String TEAL_LIGHT = "#ccfbf1";

  public EmailService(JavaMailSender mailSender) {
    this.mailSender = mailSender;
  }

  public void sendHtmlEmail(String to, String subject, String htmlBody) {
    try {
      MimeMessage msg = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
      helper.setTo(to);
      helper.setSubject(subject);
      helper.setText(wrapTemplate(htmlBody), true);
      String from = System.getenv("MAIL_USERNAME");
      if (from == null || from.isEmpty())
        from = "no-reply@smartcampus.lk";
      helper.setFrom("Smart Campus Hub <" + from + ">");
      mailSender.send(msg);
      log.info("Email sent to {}: {}", to, subject);
    } catch (Exception e) {
      log.error("Failed to send email to {}: {}", to, e.getMessage());
    }
  }

  private String wrapTemplate(String body) {
    return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head>"
        + "<body style='margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;'>"
        + "<table width='100%' cellpadding='0' cellspacing='0' style='padding:30px 0'>"
        + "<tr><td align='center'>"
        + "<table width='600' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)'>"
        + "<tr><td style='background:" + TEAL + ";padding:24px 32px;text-align:center'>"
        + "<div style='background:rgba(255,255,255,0.2);display:inline-block;border-radius:10px;padding:8px 16px;margin-bottom:8px'>"
        + "<span style='color:#fff;font-size:20px;font-weight:700'>SC</span></div>"
        + "<div style='color:#ffffff;font-size:18px;font-weight:700'>Smart Campus Hub</div>"
        + "<div style='color:" + TEAL_LIGHT + ";font-size:12px;margin-top:2px'>SLIIT - Faculty of Computing</div>"
        + "</td></tr>"
        + "<tr><td style='padding:32px'>" + body + "</td></tr>"
        + "<tr><td style='background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb'>"
        + "<p style='color:#9ca3af;font-size:11px;margin:0'>This is an automated message from Smart Campus Hub.</p>"
        + "<p style='color:#9ca3af;font-size:11px;margin:4px 0 0'>SLIIT Faculty of Computing &copy; 2026</p>"
        + "</td></tr>"
        + "</table></td></tr></table></body></html>";
  }

  // 1. Welcome Email
  @Async("emailExecutor")
  public void sendWelcomeEmail(String to, String name, String role) {
    String roleMsg;
    switch (role) {
      case "PENDING_STAFF" ->
        roleMsg = "<p style='color:#92400e;background:#fef3c7;padding:10px 14px;border-radius:8px;font-size:13px'>"
            + "&#9203; Your account is <strong>pending admin approval</strong>. You will be notified once approved.</p>";
      case "TECHNICIAN" ->
        roleMsg = "<p style='color:#065f46;background:#d1fae5;padding:10px 14px;border-radius:8px;font-size:13px'>"
            + "&#128296; You have been registered as a <strong>Technician</strong>.</p>";
      case "LECTURER" ->
        roleMsg = "<p style='color:#5b21b6;background:#ede9fe;padding:10px 14px;border-radius:8px;font-size:13px'>"
            + "&#128218; You have been registered as a <strong>Lecturer</strong>.</p>";
      case "LAB_ASSISTANT" ->
        roleMsg = "<p style='color:#0f766e;background:#ccfbf1;padding:10px 14px;border-radius:8px;font-size:13px'>"
            + "&#128300; You have been registered as a <strong>Lab Assistant</strong>.</p>";
      default ->
        roleMsg = "<p style='color:#1e40af;background:#dbeafe;padding:10px 14px;border-radius:8px;font-size:13px'>"
            + "&#127891; Your account is <strong>active</strong>. You can now log in and use the platform.</p>";
    }

    String body = "<h2 style='color:#1a1a1a;font-size:20px;margin:0 0 8px'>Welcome to Smart Campus Hub! &#128075;</h2>"
        + "<p style='color:#6b7280;font-size:14px;margin:0 0 20px'>Hi <strong>" + name
        + "</strong>, your account has been created successfully.</p>"
        + roleMsg
        + "<div style='margin:24px 0;padding:16px;background:#f0fdfa;border-radius:8px;border-left:4px solid #0f766e'>"
        + "<p style='margin:0;font-size:13px;color:#374151'>&#128231; <strong>Email:</strong> " + to + "</p>"
        + "</div>"
        + "<p style='color:#6b7280;font-size:13px'>You can access the platform at "
        + "<a href='http://localhost:5173' style='color:#0f766e'>Smart Campus Hub</a>.</p>";

    sendHtmlEmail(to, "Welcome to Smart Campus Hub", body);
  }

  // 2. Ticket Assignment Email
  @Async("emailExecutor")
  public void sendTicketAssignmentEmail(String to, String techName, Long ticketId, String ticketTitle,
      String assignedBy) {
    String body = "<h2 style='color:#1a1a1a;font-size:20px;margin:0 0 8px'>New Ticket Assigned to You &#128296;</h2>"
        + "<p style='color:#6b7280;font-size:14px;margin:0 0 20px'>Hi <strong>" + techName + "</strong>, "
        + "you have been assigned a new maintenance ticket.</p>"
        + "<div style='background:#f0fdfa;border-radius:8px;padding:16px;border-left:4px solid #0f766e;margin:16px 0'>"
        + "<p style='margin:0 0 8px;font-size:13px;color:#374151'>&#127915; <strong>Ticket #" + ticketId
        + "</strong></p>"
        + "<p style='margin:0 0 8px;font-size:14px;color:#1a1a1a;font-weight:600'>" + ticketTitle + "</p>"
        + "<p style='margin:0;font-size:12px;color:#6b7280'>Assigned by: <strong>" + assignedBy + "</strong></p>"
        + "</div>"
        + "<p style='color:#374151;font-size:13px'>Please log in to view the full ticket and update the status.</p>"
        + "<div style='text-align:center;margin:24px 0'>"
        + "<a href='http://localhost:5173/tickets/" + ticketId + "' "
        + "style='background:#0f766e;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block'>"
        + "View Ticket &rarr;</a></div>";

    sendHtmlEmail(to, "Smart Campus Hub - Ticket #" + ticketId + " Assigned to You", body);
  }

  // 3. Booking Approved Email
  @Async("emailExecutor")
  public void sendBookingApprovedEmail(String to, String name, Long bookingId,
      String resourceName, String startTime, String endTime) {
    String body = "<h2 style='color:#065f46;font-size:20px;margin:0 0 8px'>&#9989; Booking Approved!</h2>"
        + "<p style='color:#6b7280;font-size:14px;margin:0 0 20px'>Hi <strong>" + name + "</strong>, "
        + "your booking request has been <strong style='color:#065f46'>approved</strong>.</p>"
        + "<div style='background:#f0fdfa;border-radius:8px;padding:16px;border-left:4px solid #0f766e;margin:16px 0'>"
        + "<p style='margin:0 0 8px;font-size:13px;color:#374151'>&#127970; <strong>Resource:</strong> " + resourceName
        + "</p>"
        + "<p style='margin:0 0 8px;font-size:13px;color:#374151'>&#128197; <strong>From:</strong> " + startTime
        + "</p>"
        + "<p style='margin:0;font-size:13px;color:#374151'>&#128197; <strong>To:</strong> " + endTime + "</p>"
        + "</div>"
        + "<div style='text-align:center;margin:24px 0'>"
        + "<a href='http://localhost:5173/bookings/" + bookingId + "' "
        + "style='background:#0f766e;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block'>"
        + "View Booking &rarr;</a></div>";

    sendHtmlEmail(to, "Smart Campus Hub - Booking Approved", body);
  }

  // 4. Booking Rejected Email
  @Async("emailExecutor")
  public void sendBookingRejectedEmail(String to, String name, Long bookingId,
      String resourceName, String reason) {
    String body = "<h2 style='color:#991b1b;font-size:20px;margin:0 0 8px'>&#10060; Booking Rejected</h2>"
        + "<p style='color:#6b7280;font-size:14px;margin:0 0 20px'>Hi <strong>" + name + "</strong>, "
        + "unfortunately your booking request has been <strong style='color:#991b1b'>rejected</strong>.</p>"
        + "<div style='background:#fef2f2;border-radius:8px;padding:16px;border-left:4px solid #dc2626;margin:16px 0'>"
        + "<p style='margin:0 0 8px;font-size:13px;color:#374151'>&#127970; <strong>Resource:</strong> " + resourceName
        + "</p>"
        + (reason != null && !reason.isBlank()
            ? "<p style='margin:0;font-size:13px;color:#374151'>&#128221; <strong>Reason:</strong> " + reason + "</p>"
            : "")
        + "</div>"
        + "<p style='color:#6b7280;font-size:13px;margin-top:16px'>You may submit a new booking request for a different time slot.</p>"
        + "<div style='text-align:center;margin:24px 0'>"
        + "<a href='http://localhost:5173/bookings' "
        + "style='background:#0f766e;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block'>"
        + "View My Bookings &rarr;</a></div>";

    sendHtmlEmail(to, "Smart Campus Hub - Booking Request Rejected", body);
  }

  // 5. Staff Approved Email
  @Async("emailExecutor")
  public void sendStaffApprovedEmail(String to, String name, String role) {
    String roleLabel = switch (role) {
      case "TECHNICIAN" -> "Technician";
      case "LECTURER" -> "Lecturer";
      case "LAB_ASSISTANT" -> "Lab Assistant";
      default -> role;
    };
    String body = "<h2 style='color:#065f46;font-size:20px;margin:0 0 8px'>&#9989; Staff Role Approved!</h2>"
        + "<p style='color:#6b7280;font-size:14px;margin:0 0 20px'>Hi <strong>" + name + "</strong>, "
        + "your staff role request has been <strong style='color:#065f46'>approved</strong>!</p>"
        + "<div style='background:#f0fdfa;border-radius:8px;padding:16px;border-left:4px solid #0f766e;margin:16px 0'>"
        + "<p style='margin:0;font-size:14px;color:#374151'>&#127942; Your account role is now: "
        + "<strong style='color:#0f766e'>" + roleLabel + "</strong></p>"
        + "</div>"
        + "<p style='color:#6b7280;font-size:13px'>You can now log in and access all " + roleLabel + " features.</p>"
        + "<div style='text-align:center;margin:24px 0'>"
        + "<a href='http://localhost:5173' "
        + "style='background:#0f766e;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block'>"
        + "Login Now &rarr;</a></div>";

    sendHtmlEmail(to, "Smart Campus Hub - Staff Role Approved", body);
  }

  // 6. Staff Rejected Email
  @Async("emailExecutor")
  public void sendStaffRejectedEmail(String to, String name, String requestedRole) {
    String roleLabel = switch (requestedRole) {
      case "TECHNICIAN" -> "Technician";
      case "LECTURER" -> "Lecturer";
      case "LAB_ASSISTANT" -> "Lab Assistant";
      default -> requestedRole;
    };
    String body = "<h2 style='color:#991b1b;font-size:20px;margin:0 0 8px'>&#10060; Staff Role Request Rejected</h2>"
        + "<p style='color:#6b7280;font-size:14px;margin:0 0 20px'>Hi <strong>" + name + "</strong>, "
        + "your request for the <strong>" + roleLabel
        + "</strong> role has been <strong style='color:#991b1b'>rejected</strong>.</p>"
        + "<div style='background:#fef2f2;border-radius:8px;padding:16px;border-left:4px solid #dc2626;margin:16px 0'>"
        + "<p style='margin:0;font-size:13px;color:#374151'>Your account has been set back to a standard User account.</p>"
        + "</div>"
        + "<p style='color:#6b7280;font-size:13px'>If you believe this is a mistake, please contact your administrator.</p>";

    sendHtmlEmail(to, "Smart Campus Hub - Staff Role Request Rejected", body);
  }

  // 7. Password Reset Email
  @Async("emailExecutor")
  public void sendPasswordResetEmail(String to, String name, String token, String frontendUrl) {
    String resetUrl = frontendUrl + "/reset-password?token=" + token;
    String body = "<h2 style='color:#1a1a1a;font-size:20px;margin:0 0 8px'>&#128272; Password Reset Request</h2>"
        + "<p style='color:#6b7280;font-size:14px;margin:0 0 20px'>Hi <strong>" + name + "</strong>, "
        + "we received a request to reset your password. Click the button below to set a new password.</p>"
        + "<div style='background:#fef3c7;border-radius:8px;padding:12px 16px;border-left:4px solid #f59e0b;margin:16px 0'>"
        + "<p style='margin:0;font-size:13px;color:#92400e'>&#9203; This link expires in <strong>30 minutes</strong>. "
        + "If you did not request a password reset, you can safely ignore this email.</p>"
        + "</div>"
        + "<div style='text-align:center;margin:28px 0'>"
        + "<a href='" + resetUrl + "' "
        + "style='background:#0f766e;color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block'>"
        + "Reset Password &rarr;</a></div>"
        + "<p style='color:#9ca3af;font-size:12px;text-align:center'>Or copy this link into your browser:<br>"
        + "<span style='color:#0f766e;font-size:11px;word-break:break-all'>" + resetUrl + "</span></p>";

    sendHtmlEmail(to, "Smart Campus Hub - Password Reset", body);
  }

  // 8. OAuth Account Info Email
  @Async("emailExecutor")
  public void sendOAuthAccountEmail(String to, String name) {
    String body = "<h2 style='color:#1a1a1a;font-size:20px;margin:0 0 8px'>&#128273; Password Reset Info</h2>"
        + "<p style='color:#6b7280;font-size:14px;margin:0 0 20px'>Hi <strong>" + name + "</strong>,</p>"
        + "<div style='background:#ede9fe;border-radius:8px;padding:16px;border-left:4px solid #7c3aed;margin:16px 0'>"
        + "<p style='margin:0;font-size:13px;color:#5b21b6'>Your account was created using Google or Microsoft sign-in. "
        + "Password reset is not available for OAuth accounts. "
        + "Please sign in using your Google or Microsoft account.</p>"
        + "</div>"
        + "<div style='text-align:center;margin:24px 0'>"
        + "<a href='http://localhost:5173/login' "
        + "style='background:#0f766e;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block'>"
        + "Go to Login &rarr;</a></div>";

    sendHtmlEmail(to, "Smart Campus Hub - Password Reset Info", body);
  }
}