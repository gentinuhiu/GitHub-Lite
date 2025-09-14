package org.example.emt_project.web.controllers;

import org.example.emt_project.dto.DisplaySearchUserDto;
import org.example.emt_project.dto.DisplayUserDto;
import org.example.emt_project.model.domain.User;
import org.example.emt_project.service.application.UserApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private final UserApplicationService userService;

    public UserController(UserApplicationService userService) {
        this.userService = userService;
    }

//    @GetMapping
//    public ResponseEntity<DisplayUserDto> getUser(@AuthenticationPrincipal User user){
//        return ResponseEntity.ok(DisplayUserDto.from(user));
//    }

    @PostMapping("/{username}")
    public ResponseEntity<DisplayUserDto> getByUsername(@AuthenticationPrincipal User user, @PathVariable String username) {
        boolean ownProfile = user != null && user.getUsername().equals(username);
        Optional<DisplayUserDto> displayUserDtoOptional = userService.findByUsername(username);

        if(displayUserDtoOptional.isEmpty())
            return ResponseEntity.notFound().build();

        DisplayUserDto displayUserDto = displayUserDtoOptional.get();
        return ResponseEntity.ok(DisplayUserDto.from(displayUserDto, ownProfile));
    }

    @GetMapping("/search")
    public ResponseEntity<List<DisplaySearchUserDto>> searchByUsername(@RequestParam String username){
        return ResponseEntity.ok(DisplaySearchUserDto.from(userService.searchByUsername(username)));
    }
}
