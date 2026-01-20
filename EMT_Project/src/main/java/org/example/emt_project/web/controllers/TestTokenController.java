package org.example.emt_project.web.controllers;

import org.example.emt_project.repository.UserRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * TEST-ONLY controller.
 * Used by Cypress E2E tests to fetch reset-password tokens.
 *
 * NEVER expose this in production.
 */
@Profile("test")
@RestController
@RequestMapping("/api/test")
public class TestTokenController {

    private final UserRepository userRepository;

    public TestTokenController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Example:
     * GET /api/test/token?email=user@test.com
     *
     * @return reset token or empty string
     */
    @GetMapping("/token")
    public String getTokenByEmail(@RequestParam String email) {
        return userRepository.findByEmail(email)
                .map(user -> user.getToken() == null ? "" : user.getToken())
                .orElse("");
    }
}
