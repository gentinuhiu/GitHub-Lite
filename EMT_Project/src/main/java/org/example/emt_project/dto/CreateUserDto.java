package org.example.emt_project.dto;

import org.example.emt_project.model.domain.User;

public record CreateUserDto(
        String name,
        String username,
        String password,
        String repeatPassword,
        String email
) {
    public User toUser() {
        return new User(
                username,
                password,
                email
        );
    }
}