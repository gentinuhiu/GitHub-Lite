package org.example.emt_project.web.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.example.emt_project.dto.CreateUserDto;
import org.example.emt_project.dto.ForgotPasswordDto;
import org.example.emt_project.dto.LoginUserDto;
import org.example.emt_project.dto.ResetPasswordDto;
import org.example.emt_project.model.domain.User;
import org.example.emt_project.service.application.UserApplicationService;
import org.example.emt_project.web.exceptions.InvalidArgumentsException;
import org.example.emt_project.web.exceptions.PasswordsDoNotMatchException;
import org.example.emt_project.web.exceptions.UserNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@CrossOrigin("http://localhost:3000")
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication API", description = "Endpoints for user authentication and registration") // Swagger tag
public class AuthController {
    private final UserApplicationService userService;

    public AuthController(UserApplicationService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<String> authenticate(@AuthenticationPrincipal User user){
        return ResponseEntity.ok(user.getUsername());
    }

    @Operation(summary = "Register a new user", description = "Creates a new user account")
    @ApiResponse(responseCode = "200", description = "User registered successfully")
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody CreateUserDto createUserDto) {
        try {
            return ResponseEntity.ok(userService.register(createUserDto));
        } catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "User login", description = "Authenticates a user and generates a JWT")
    @ApiResponse(responseCode = "200", description = "User authenticated successfully")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginUserDto loginUserDto) {
        try {
            return ResponseEntity.ok(userService.login(loginUserDto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "User logout", description = "Ends the user's session")
    @ApiResponse(responseCode = "200", description = "User logged out successfully")
    @GetMapping("/logout")
    public void logout(HttpServletRequest request) {
        request.getSession().invalidate();
    }

    @Operation(summary = "Forgot password", description = "Sends email to user's account")
    @ApiResponse(responseCode = "200", description = "Email sent successfully")
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordDto dto) {
        try {
            userService.forgotPassword(dto);
            return ResponseEntity.ok("Email has been sent to your account");
        } catch (UserNotFoundException | InvalidArgumentsException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Resetpassword", description = "Resets password for a user")
    @ApiResponse(responseCode = "200", description = "Password has been reset")
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordDto dto) {
        try{
            userService.resetPassword(dto);
            return ResponseEntity.ok("Your password has been reset");
        } catch (InvalidArgumentsException | UserNotFoundException |
                 PasswordsDoNotMatchException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
