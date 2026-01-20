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
class AuthRegisterIntegrationTests {

    private static final String REGISTER = "/api/auth/register";

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    void register_success_shouldReturn200_andUserJson() throws Exception {
        String unique = String.valueOf(System.currentTimeMillis());

        CreateUserDto body = new CreateUserDto(
                "name" + unique,
                "user" + unique,
                "Password123!",
                "Password123!",
                "mail" + unique + "@test.com"
        );

        mockMvc.perform(post(REGISTER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.username", is(body.username())))
                .andExpect(jsonPath("$.email", is(body.email())));
    }

    @Test
    void register_missingFields_shouldReturn400_andMessage() throws Exception {
        // missing / empty fields triggers: "All input fields are required"
        String badJson = """
            {
              "name": "",
              "username": "",
              "password": "",
              "repeatPassword": "",
              "email": ""
            }
        """;

        mockMvc.perform(post(REGISTER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(badJson))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("All input fields are required")));
    }

    @Test
    void register_passwordsDoNotMatch_shouldReturn400() throws Exception {
        String unique = String.valueOf(System.currentTimeMillis());

        CreateUserDto body = new CreateUserDto(
                "name" + unique,
                "user" + unique,
                "Password123!",
                "Password999!",
                "mail" + unique + "@test.com"
        );

        mockMvc.perform(post(REGISTER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_invalidEmail_shouldReturn400_andMessage() throws Exception {
        String unique = String.valueOf(System.currentTimeMillis());

        CreateUserDto body = new CreateUserDto(
                "name" + unique,
                "user" + unique,
                "Password123!",
                "Password123!",
                "not-an-email"
        );

        mockMvc.perform(post(REGISTER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Email is not valid")));
    }

    @Test
    void register_invalidUsername_shouldReturn400_andMessage() throws Exception {
        String unique = String.valueOf(System.currentTimeMillis());

        // username must be letters+numbers only
        CreateUserDto body = new CreateUserDto(
                "name" + unique,
                "user_" + unique,
                "Password123!",
                "Password123!",
                "mail" + unique + "@test.com"
        );

        mockMvc.perform(post(REGISTER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Username should be made up of letters and numbers only")));
    }

    @Test
    void register_duplicateUsername_shouldReturn400() throws Exception {
        String unique = String.valueOf(System.currentTimeMillis());
        String username = "dupuser" + unique;

        CreateUserDto first = new CreateUserDto("A", username, "Password123!", "Password123!", "a" + unique + "@test.com");
        CreateUserDto second = new CreateUserDto("B", username, "Password123!", "Password123!", "b" + unique + "@test.com");

        mockMvc.perform(post(REGISTER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(first)))
                .andExpect(status().isOk());

        mockMvc.perform(post(REGISTER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(second)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_duplicateEmail_shouldReturn400() throws Exception {
        String unique = String.valueOf(System.currentTimeMillis());
        String email = "dup" + unique + "@test.com";

        CreateUserDto first = new CreateUserDto("A", "userA" + unique, "Password123!", "Password123!", email);
        CreateUserDto second = new CreateUserDto("B", "userB" + unique, "Password123!", "Password123!", email);

        mockMvc.perform(post(REGISTER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(first)))
                .andExpect(status().isOk());

        mockMvc.perform(post(REGISTER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(second)))
                .andExpect(status().isBadRequest());
    }

    record CreateUserDto(String name, String username, String password, String repeatPassword, String email) {}
}
