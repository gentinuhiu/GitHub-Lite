package org.example.emt_project.dto;

public record LoginResponseDto(String token, String username) {
    public static LoginResponseDto from(String token, String username){
        return new LoginResponseDto(token, username);
    }
}
