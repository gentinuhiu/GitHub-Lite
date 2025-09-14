package org.example.emt_project.dto;

public record ResetPasswordDto(String token,
                               String password,
                               String repeatedPassword){}
