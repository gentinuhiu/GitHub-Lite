package org.example.emt_project.service.domain;

import org.example.emt_project.dto.CreateUserDto;
import org.example.emt_project.dto.DisplayUserDto;
import org.example.emt_project.dto.LoginResponseDto;
import org.example.emt_project.model.domain.User;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.Optional;

public interface UserService extends UserDetailsService {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    String login(String username, String password);

    User register(CreateUserDto createUserDto);

    User save(User user);

    void forgotPassword(String email);

    void resetPassword(String token, String password, String repeatedPassword);

    Optional<User> findByToken(String token);
}