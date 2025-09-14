package org.example.emt_project.dto;

import org.example.emt_project.model.domain.Repository;
import org.example.emt_project.model.domain.User;

import java.util.List;

public record DisplayUserDto(Long id, String username, String email, boolean ownProfile) {
    public static DisplayUserDto from(User user) {
        return new DisplayUserDto(user.getId(), user.getUsername(), user.getEmail(), false);
    }
    public static DisplayUserDto from(DisplayUserDto user, boolean ownProfile) {
        return new DisplayUserDto(user.id(), user.username(), user.email(), ownProfile);
    }
}
