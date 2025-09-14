package org.example.emt_project.service.domain.impl;

import org.example.emt_project.dto.CreateUserDto;
import org.example.emt_project.dto.DisplayUserDto;
import org.example.emt_project.dto.LoginResponseDto;
import org.example.emt_project.model.domain.User;
import org.example.emt_project.repository.UserRepository;
import org.example.emt_project.service.domain.MailSenderService;
import org.example.emt_project.service.domain.UserService;
import org.example.emt_project.web.exceptions.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.example.emt_project.helpers.JwtHelper;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService {
    private final PasswordEncoder passwordEncoder;
    private final JwtHelper jwtHelper;
    private final MailSenderService mailSenderService;
    private final UserRepository userRepository;

    public UserServiceImpl(PasswordEncoder passwordEncoder, JwtHelper jwtHelper, MailSenderService mailSenderService, UserRepository userRepository) {
        this.passwordEncoder = passwordEncoder;
        this.jwtHelper = jwtHelper;
        this.mailSenderService = mailSenderService;
        this.userRepository = userRepository;
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public String login(String username, String password) {
        // PRESENCE
//        if (username == null || username.isEmpty() || password == null || password.isEmpty()) {
//            throw new InvalidArgumentsException("Invalid data entered");
//        }
        User user = findByUsername(username)
                .orElseThrow(InvalidUserCredentialsException::new);

        if(!passwordEncoder.matches(password, user.getPassword()))
            throw new InvalidUserCredentialsException();

        return jwtHelper.generateToken(user);
    }

    @Override
    public User register(CreateUserDto createUserDto) {
        String username = createUserDto.username();
        String password = createUserDto.password();
        String repeatPassword = createUserDto.repeatPassword();
        String name = createUserDto.name();
        String email = createUserDto.email();

        // PRESENCE
        if (username == null || password == null || repeatPassword == null || name == null
                || email == null || username.isEmpty() || password.isEmpty()
                || repeatPassword.isEmpty() || name.isEmpty() || email.isEmpty()) {
            throw new InvalidArgumentsException("All input fields are required");
        }

        // VALIDATION
        if (!password.equals(repeatPassword)) {
            throw new PasswordsDoNotMatchException();
        }
        boolean isValid = email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
        if(!isValid){
            throw new InvalidArgumentsException("Email is not valid");
        }
        isValid = username.matches("^[a-zA-Z0-9]+$");
        if(!isValid){
            throw new InvalidArgumentsException("Username should be made up of letters and numbers only");
        }

        // CHECK
        if (findByUsername(username).isPresent()) {
            throw new UsernameAlreadyExistsException(username);
        }
        if(findByEmail(email).isPresent()){
            throw new EmailAlreadyExistsException(email);
        }

        User user = new User(username, passwordEncoder.encode(password), email);
        return userRepository.save(user);
    }

    @Override
    public User save(User user) {
        return userRepository.save(user);
    }

    @Override
    public void forgotPassword(String email) {
        if(email == null || email.isEmpty()) {
            throw new InvalidArgumentsException("Invalid data entered");
        }

        Optional<User> optionalUser = findByEmail(email);

        if(optionalUser.isEmpty()) {
            throw new UserNotFoundException(email);
        }
        User user = optionalUser.get();
        String token = UUID.randomUUID().toString();
        user.setToken(token);
        user.setTokenSent(LocalDateTime.now());
        save(user);
        mailSenderService.sendResetPasswordEmail(user.getUsername(), user.getEmail(), token);
    }

    @Override
    public Optional<User> findByToken(String token) {
        return userRepository.findByToken(token);
    }

    @Override
    public void resetPassword(String token, String password, String repeatedPassword) {
        if(token == null || token.isEmpty() || password == null || password.isEmpty()
                || repeatedPassword == null || repeatedPassword.isEmpty())
            throw new InvalidArgumentsException("Invalid data entered");

        // VALIDATION
        Optional<User> optionalUser = findByToken(token);
        if(optionalUser.isEmpty())
            throw new UserNotFoundException("token");

        User user = optionalUser.get();
        if(Duration.between(user.getTokenSent(), LocalDateTime.now()).toMinutes() > 10)
            throw new InvalidArgumentsException("Token has expired");
        if(!password.equals(repeatedPassword))
            throw new PasswordsDoNotMatchException();

        user.setPassword(passwordEncoder.encode(password));
        user.setLastPasswordChange(LocalDateTime.now());
        user.setToken(null);
        user.setTokenSent(null);
        save(user);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(username));
    }
}
