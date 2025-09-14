package org.example.emt_project.web.exceptions;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String username) {
        super(String.format("User with credentials: %s was not found", username));
    }
}

