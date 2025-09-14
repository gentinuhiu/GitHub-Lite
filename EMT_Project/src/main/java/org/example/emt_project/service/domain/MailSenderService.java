package org.example.emt_project.service.domain;

public interface MailSenderService {
    void sendVerificationEmail(String username, String email, String token);

    void sendResetPasswordEmail(String username, String email, String token);
}
