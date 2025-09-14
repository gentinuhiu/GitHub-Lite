package org.example.emt_project.web.exceptions;

public class InvalidUserCredentialsException extends RuntimeException {
    public InvalidUserCredentialsException() {
        super("Incorrect credentials");
    }
}
