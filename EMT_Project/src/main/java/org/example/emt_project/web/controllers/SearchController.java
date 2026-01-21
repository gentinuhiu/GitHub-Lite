package org.example.emt_project.web.controllers;

import org.example.emt_project.dto.SearchRowDto;
import org.example.emt_project.repository.RepositoryRepository;
import org.example.emt_project.repository.UserRepository;
import org.example.emt_project.service.application.RepositoryApplicationService;
import org.example.emt_project.service.application.UserApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/search")
@CrossOrigin("http://localhost:3000")
public class SearchController {
    private final UserApplicationService userApplicationService;
    private final RepositoryApplicationService repositoryApplicationService;
    private final DateTimeFormatter iso = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private final UserRepository userRepository;
    private final RepositoryRepository repositoryRepository;

    public SearchController(UserApplicationService userApplicationService, RepositoryApplicationService repositoryApplicationService, UserRepository userRepository, RepositoryRepository repositoryRepository) {
        this.userApplicationService = userApplicationService;
        this.repositoryApplicationService = repositoryApplicationService;
        this.userRepository = userRepository;
        this.repositoryRepository = repositoryRepository;
    }

    @GetMapping
    public List<SearchRowDto> search(
            @RequestParam(name = "q", required = false) String q,
            @RequestParam(name = "query", required = false) String query
    ) {
        String term = Optional.ofNullable(q).orElse(query);
        if (term == null || term.isBlank()) {
            return List.of();
        }

        List<SearchRowDto> rows = new ArrayList<>();

        userRepository.findByUsernameContainingIgnoreCase(term).forEach(u ->
                rows.add(new SearchRowDto(
                        String.valueOf(u.getId()),
                        safe(u.getUsername()),
                        safe(u.getEmail()),
                        "U"
                ))
        );

        repositoryRepository.findByNameContainingIgnoreCase(term).forEach(r ->
                rows.add(new SearchRowDto(
                        String.valueOf(r.getId()),
                        safe(r.getName()),
                        r.getCreatedAt() != null ? r.getCreatedAt().format(iso) : "",
                        "R"
                ))
        );

        return rows;
    }

    @PostMapping("/entity")
    public ResponseEntity<?> lookupEntity(@RequestBody(required = false) EntityLookupRequest body) {
        if (body == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Body required: { id, type }"));
        }

        Long id = body.id != null ? body.id : parseLongOrNull(body.attr0);
        String type = firstNonBlank(body.type, body.attr3);

        if (id == null || isBlank(type)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Both id and type ('U'|'R') are required"));
        }

        if ("U".equalsIgnoreCase(type)) {
            return userRepository.findById(id)
                    .<ResponseEntity<?>>map(u -> ResponseEntity.ok(new UserDto(u.getId(), u.getUsername(), u.getEmail())))
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } else if ("R".equalsIgnoreCase(type)) {
            return repositoryRepository.findById(id)
                    .<ResponseEntity<?>>map(r -> ResponseEntity.ok(new RepoDto(r.getId(), r.getName(), r.getCreatedAt())))
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "type must be 'U' or 'R'"));
        }
    }

    public static class EntityLookupRequest {
        public Long id;         // or attr0
        public String type;     // 'U' | 'R'  (or attr3)
        public String attr0;    // optional convenience
        public String attr3;    // optional convenience
    }

    public static record UserDto(Long id, String username, String email) {}

    public static record RepoDto(Long id, String name, LocalDateTime createdAt) {}

    private static String safe(String s) { return s == null ? "" : s; }
    private static boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
    private static String firstNonBlank(String a, String b) { return !isBlank(a) ? a : b; }
    private static Long parseLongOrNull(String v) {
        try { return v == null ? null : Long.parseLong(v); } catch (NumberFormatException e) { return null; }
    }
}

