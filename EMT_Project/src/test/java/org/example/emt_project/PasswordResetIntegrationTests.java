package org.example.emt_project;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.emt_project.model.domain.User;
import org.example.emt_project.repository.UserRepository;
import org.example.emt_project.service.domain.MailSenderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class PasswordResetIntegrationTests {

    private static final String REGISTER = "/api/auth/register";
    private static final String FORGOT = "/api/auth/forgot-password";
    private static final String RESET = "/api/auth/reset-password";

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Autowired UserRepository userRepository;
    @Autowired PasswordEncoder passwordEncoder;

    @MockitoBean
    private MailSenderService mailSenderService;

    // -------------------------
    // Helpers
    // -------------------------

    private String unique() {
        return String.valueOf(System.currentTimeMillis());
    }

    private void registerUser(String name, String username, String password, String email) throws Exception {
        var body = new CreateUserDto(name, username, password, password, email);

        mockMvc.perform(post(REGISTER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());
    }

    private User mustFindByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() ->
                new AssertionError("Test expected a user with email " + email + " to exist"));
    }

    // -------------------------
    // FORGOT PASSWORD TESTS
    // -------------------------

    @Test
    void forgotPassword_success_shouldReturn200_andSetToken_andSendEmail() throws Exception {
        String u = unique();
        String username = "user" + u;
        String email = "mail" + u + "@test.com";
        registerUser("Name", username, "Password123!", email);

        mockMvc.perform(post(FORGOT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ForgotPasswordDto(email))))
                .andExpect(status().isOk())
                .andExpect(content().string(is("Email has been sent to your account")));

        User user = mustFindByEmail(email);
        if (user.getToken() == null || user.getToken().isBlank()) {
            throw new AssertionError("Expected token to be set after forgot-password");
        }
        if (user.getTokenSent() == null) {
            throw new AssertionError("Expected tokenSent to be set after forgot-password");
        }

        verify(mailSenderService, atLeastOnce())
                .sendResetPasswordEmail(eq(username), eq(email), anyString());
    }

    @Test
    void forgotPassword_emptyEmail_shouldReturn400_andMessage() throws Exception {
        mockMvc.perform(post(FORGOT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ForgotPasswordDto(""))))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Invalid data entered")));
    }

    @Test
    void forgotPassword_unknownEmail_shouldReturn400() throws Exception {
        String email = "no_user_" + unique() + "@test.com";

        mockMvc.perform(post(FORGOT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ForgotPasswordDto(email))))
                .andExpect(status().isBadRequest());
    }

    // -------------------------
    // RESET PASSWORD TESTS
    // -------------------------

    @Test
    void resetPassword_success_shouldReturn200_andUpdatePassword_andClearToken() throws Exception {
        String u = unique();
        String username = "user" + u;
        String email = "mail" + u + "@test.com";
        registerUser("Name", username, "Password123!", email);

        // Issue forgot-password to create token
        mockMvc.perform(post(FORGOT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ForgotPasswordDto(email))))
                .andExpect(status().isOk());

        User user = mustFindByEmail(email);
        String token = user.getToken();

        String newPass = "NewPassword123!";

        mockMvc.perform(post(RESET)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ResetPasswordDto(token, newPass, newPass))))
                .andExpect(status().isOk())
                .andExpect(content().string(is("Your password has been reset")));

        User updated = mustFindByEmail(email);

        // token cleared
        if (updated.getToken() != null) {
            throw new AssertionError("Expected token to be cleared after reset-password");
        }
        if (updated.getTokenSent() != null) {
            throw new AssertionError("Expected tokenSent to be cleared after reset-password");
        }

        // password updated (hashed)
        if (!passwordEncoder.matches(newPass, updated.getPassword())) {
            throw new AssertionError("Expected password to be updated (PasswordEncoder.matches failed)");
        }

        if (updated.getLastPasswordChange() == null) {
            throw new AssertionError("Expected lastPasswordChange to be set after reset-password");
        }
    }

    @Test
    void resetPassword_missingFields_shouldReturn400_andMessage() throws Exception {
        mockMvc.perform(post(RESET)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ResetPasswordDto("", "", ""))))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Invalid data entered")));
    }

    @Test
    void resetPassword_invalidToken_shouldReturn400() throws Exception {
        String token = UUID.randomUUID().toString();
        mockMvc.perform(post(RESET)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ResetPasswordDto(token, "NewPass123!", "NewPass123!"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void resetPassword_expiredToken_shouldReturn400_andMessage() throws Exception {
        String u = unique();
        String username = "user" + u;
        String email = "mail" + u + "@test.com";
        registerUser("Name", username, "Password123!", email);

        // Manually set an expired token
        User user = mustFindByEmail(email);
        user.setToken("expired-" + UUID.randomUUID());
        user.setTokenSent(LocalDateTime.now().minusMinutes(11)); // > 10 minutes
        userRepository.save(user);

        mockMvc.perform(post(RESET)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ResetPasswordDto(user.getToken(), "NewPass123!", "NewPass123!"))))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Token has expired")));
    }

    @Test
    void resetPassword_passwordsDoNotMatch_shouldReturn400() throws Exception {
        String u = unique();
        String username = "user" + u;
        String email = "mail" + u + "@test.com";
        registerUser("Name", username, "Password123!", email);

        // Create token via forgot
        mockMvc.perform(post(FORGOT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ForgotPasswordDto(email))))
                .andExpect(status().isOk());

        User user = mustFindByEmail(email);

        mockMvc.perform(post(RESET)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ResetPasswordDto(user.getToken(), "NewPass123!", "DifferentPass123!"))))
                .andExpect(status().isBadRequest());
    }

    record ForgotPasswordDto(String email) {}
    record ResetPasswordDto(String token, String password, String repeatedPassword) {}
    record CreateUserDto(String name, String username, String password, String repeatPassword, String email) {}
}

