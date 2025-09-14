package org.example.emt_project.service.application.impl;

import org.example.emt_project.dto.*;
import org.example.emt_project.model.domain.User;
import org.example.emt_project.repository.UserRepository;
import org.example.emt_project.service.application.UserApplicationService;
import org.example.emt_project.service.domain.UserService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserApplicationServiceImpl implements UserApplicationService {
    private final UserService userService;
    private final UserRepository userRepository;

    public UserApplicationServiceImpl(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @Override
    public Optional<DisplayUserDto> findByUsername(String username) {
        return Optional.of(DisplayUserDto.from(userService.findByUsername(username).orElseThrow()));
    }

    @Override
    public Optional<DisplayUserDto> findByEmail(String email) {
        return Optional.of(DisplayUserDto.from(userService.findByEmail(email).orElseThrow()));
    }

    @Override
    public LoginResponseDto login(LoginUserDto loginUserDto) {
        return LoginResponseDto.from(userService.login(loginUserDto.username(), loginUserDto.password()), loginUserDto.username());
    }

    @Override
    public DisplayUserDto register(CreateUserDto createUserDto) {
        return DisplayUserDto.from(userService.register(createUserDto));
    }

    @Override
    public void forgotPassword(ForgotPasswordDto forgotPasswordDto) {
        userService.forgotPassword(forgotPasswordDto.email());
    }

    @Override
    public void resetPassword(ResetPasswordDto resetPasswordDto) {
        userService.resetPassword(resetPasswordDto.token(),
                resetPasswordDto.password(), resetPasswordDto.repeatedPassword());
    }

    @Override
    public List<User> searchByUsername(String username) {
        return userRepository.findByUsernameContainingIgnoreCase(username);
    }
}
