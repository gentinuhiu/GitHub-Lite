package org.example.emt_project;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class AuthLoginIntegrationTests {

    private static final String REGISTER = "/api/auth/register";
    private static final String LOGIN = "/api/auth/login";

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    void login_success_shouldReturn200_andJwtTokenString() throws Exception {
        String unique = String.valueOf(System.currentTimeMillis());
        String username = "user" + unique;
        String email = "mail" + unique + "@test.com";
        String password = "Password123!";

        // register first
        CreateUserDto registerBody = new CreateUserDto("Name", username, password, password, email);
        mockMvc.perform(post(REGISTER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerBody)))
                .andExpect(status().isOk());

        // login
        LoginUserDto loginBody = new LoginUserDto(username, password);

        mockMvc.perform(post(LOGIN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginBody)))
                .andExpect(status().isOk())
                // since controller returns ResponseEntity.ok(String token)
                .andExpect(content().string(not(isEmptyOrNullString())));
    }

    @Test
    void login_wrongPassword_shouldReturn400() throws Exception {
        String unique = String.valueOf(System.currentTimeMillis());
        String username = "user" + unique;
        String email = "mail" + unique + "@test.com";
        String password = "Password123!";

        // register
        CreateUserDto registerBody = new CreateUserDto("Name", username, password, password, email);
        mockMvc.perform(post(REGISTER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerBody)))
                .andExpect(status().isOk());

        // login wrong pass
        LoginUserDto loginBody = new LoginUserDto(username, "WrongPassword!");

        mockMvc.perform(post(LOGIN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginBody)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_unknownUser_shouldReturn400() throws Exception {
        LoginUserDto loginBody = new LoginUserDto("no_such_user_" + System.currentTimeMillis(), "Password123!");

        mockMvc.perform(post(LOGIN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginBody)))
                .andExpect(status().isBadRequest());
    }

    record CreateUserDto(String name, String username, String password, String repeatPassword, String email) {}
    record LoginUserDto(String username, String password) {}
}
