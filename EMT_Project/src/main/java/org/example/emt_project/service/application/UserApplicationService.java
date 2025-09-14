package org.example.emt_project.service.application;

import org.example.emt_project.dto.*;
import org.example.emt_project.model.domain.User;

import java.util.List;
import java.util.Optional;

public interface UserApplicationService {
    Optional<DisplayUserDto> findByUsername(String username);

    Optional<DisplayUserDto> findByEmail(String email);

    LoginResponseDto login(LoginUserDto loginUserDto);

    DisplayUserDto register(CreateUserDto createUserDto);

    void forgotPassword(ForgotPasswordDto forgotPasswordDto);

    void resetPassword(ResetPasswordDto resetPasswordDto);

    List<User> searchByUsername(String username);
}
