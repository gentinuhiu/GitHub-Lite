package org.example.emt_project.service.domain.impl;

import org.example.emt_project.service.domain.MailSenderService;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;

@Service
public class MailSenderServiceImpl implements MailSenderService {
    private final JavaMailSender mailSender;

    public MailSenderServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendVerificationEmail(String username, String email, String token) {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        try {
            helper.setTo(email);
            helper.setSubject("Profile Email Verification");
            helper.setText("Hi " + username + "," +
                    "<br><br>Email verification for your account has been requested.<br>" +
                    "Click here to verify the email: " +
                    "<a href='http://localhost:8080/verifyEmail?token=" + token + "'>Verify</a><br><br>" +
                    "If you did not request this verification, you may change your account password.<br>" +
                    "Do not reply to this email", true);
        }
        catch (MessagingException e) {
            e.printStackTrace();
        }
        mailSender.send(message);
    }

    @Override
    public void sendResetPasswordEmail(String username, String email, String token) {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        try {
            helper.setTo(email);
            helper.setSubject("Password Reset");
            helper.setText("Hi " + username + "," +
                    "<br><br>Password reset for your account has been requested.<br>" +
                    "Click here to enter the new password: " +
                    "<a href='http://localhost:3000/reset-password?token=" + token + "'>Reset</a><br><br>" +
                    "If you did not request this reset, you may change your account password.<br>" +
                    "Do not reply to this email", true);
        }
        catch (MessagingException e) {
            e.printStackTrace();
        }
        mailSender.send(message);
    }

//    @Override
//    public void sendResetPasswordEmail(String email) {
//
//    }
}
