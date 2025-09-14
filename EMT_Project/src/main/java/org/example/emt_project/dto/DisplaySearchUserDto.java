package org.example.emt_project.dto;

import org.example.emt_project.model.domain.User;

import java.util.List;

public record DisplaySearchUserDto (String username, String email){
        public static DisplaySearchUserDto from(User user) {
            return new DisplaySearchUserDto(user.getUsername(), user.getEmail());
        }
        public static List<DisplaySearchUserDto> from(List<User> users) {
            return users.stream().map(DisplaySearchUserDto::from).toList();
        }
}
