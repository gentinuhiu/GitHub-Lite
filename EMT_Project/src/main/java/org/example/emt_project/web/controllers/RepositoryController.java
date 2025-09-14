package org.example.emt_project.web.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import jakarta.validation.Payload;
import org.example.emt_project.dto.*;
import org.example.emt_project.model.domain.Repository;
import org.example.emt_project.model.domain.User;
import org.example.emt_project.service.application.RepositoryApplicationService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/repositories")
public class RepositoryController {
    private final RepositoryApplicationService repositoryApplicationService;


    public RepositoryController(RepositoryApplicationService repositoryApplicationService) {
        this.repositoryApplicationService = repositoryApplicationService;
    }

    @GetMapping
    public List<DisplayRepositoryDto> findAll(){
        return repositoryApplicationService.findAll();
    }

    @GetMapping("/{username}")
    public ResponseEntity<List<DisplayRepositoryDto>> getAllForUser(@PathVariable String username, @AuthenticationPrincipal User user) {
        if(user.getUsername().equals(username))
            return ResponseEntity.ok(repositoryApplicationService.findByOwnerUsername(username));
        return ResponseEntity.ok(repositoryApplicationService.findPublicByUsername(username));
    }

    @GetMapping("/details/{id}")
    public ResponseEntity<DisplayRepositoryDto> findById(@PathVariable Long id){
        return repositoryApplicationService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/collaborators/{repo}")
    public ResponseEntity<List<DisplaySearchUserDto>> getCollaborators(@PathVariable Long repo){
        return ResponseEntity.ok(repositoryApplicationService.getCollaborators(repo));
    }

    @GetMapping("/commits/{repo}")
    public ResponseEntity<List<DisplayCommitDto>> getCommits(@PathVariable Long repo){
        return ResponseEntity.ok(repositoryApplicationService.getCommits(repo));
    }

    @PostMapping("/add")
    public ResponseEntity<DisplayRepositoryDto> save(@RequestBody CreateRepositoryDto createRepositoryDto, @AuthenticationPrincipal User user){
        return ResponseEntity.ok(repositoryApplicationService.save(createRepositoryDto, user));

    }

    @PostMapping("/edit/{id}")
    public ResponseEntity<DisplayRepositoryDto> edit(@PathVariable Long id, @RequestBody CreateRepositoryDto createRepositoryDto,
                                                     @AuthenticationPrincipal User user){
        return repositoryApplicationService.update(id,createRepositoryDto, user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<DisplayRepositoryDto> delete(@PathVariable Long id){
        return repositoryApplicationService.deleteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/filter-by-name/{name}")
    public ResponseEntity<List<DisplayRepositoryDto>> findByName(@PathVariable String name){
        return ResponseEntity.ok(repositoryApplicationService.findByName(name));

    }

    @Operation(summary = "Upload a repository as a zip file")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DisplayRepositoryDto> uploadRepository(
            @Parameter(description = "Zip file to upload", content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE))
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user)throws IOException {
        try {
            return ResponseEntity.ok(repositoryApplicationService.uploadRepository(file, user.getUsername()));
        } catch (IllegalArgumentException exception) {
            // Погрешен фајл формат
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            // Проблем при читање на фајлот
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

    }

    @GetMapping("/download/{id}")
    public ResponseEntity<ByteArrayResource> downloadRepository(@PathVariable Long id){
        ByteArrayResource resource = repositoryApplicationService.getRepoDataForDownload(id);

        return ResponseEntity.ok()
                .contentLength(resource.contentLength())
                .contentType(MediaType.parseMediaType("application/zip"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + resource.getFilename()+ "\"")
                .body(resource);
    }

    @CrossOrigin("http://localhost:3000")
    @GetMapping("/identify/{repo}")
    public ResponseEntity<DisplayUserDto> identifyUserToRepository(@PathVariable Long repo, @AuthenticationPrincipal User user){
        return ResponseEntity.ok(repositoryApplicationService.identify(repo, user.getUsername()));
    }

    @PostMapping(value = "/upload-dir/{repo_id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadZip(@PathVariable("repo_id") Long repoId,
                                          @RequestParam(value = "path", required = false, defaultValue = "") String path,
                                          @RequestPart("archive") MultipartFile archive,
                                          @AuthenticationPrincipal User user) throws Exception {

        return ResponseEntity.ok(repositoryApplicationService.uploadDirectory(repoId, path, archive, user));
    }

    @DeleteMapping("/delete-dir/{repo_id}")
    public ResponseEntity<DisplayRepositoryDto> deleteDir(@PathVariable Long repo_id, @RequestParam String path,
                                                          @AuthenticationPrincipal User user){
        return ResponseEntity.ok(repositoryApplicationService.deleteDirectory(repo_id, path, user));
    }

    @DeleteMapping("/delete-file/{repo_id}")
    public ResponseEntity<DisplayRepositoryDto> deleteFile(@PathVariable Long repo_id, @RequestParam String path,
                                                           @AuthenticationPrincipal User user){
        return ResponseEntity.ok(repositoryApplicationService.deleteFile(repo_id, path, user));
    }

    @PostMapping("/add-collaborator/{repoId}")
    public ResponseEntity<DisplayRepositoryDto> addCollaborator(@PathVariable Long repoId, @RequestBody PayloadDto payloadDto,
                                                                @AuthenticationPrincipal User user){
        return ResponseEntity.ok(repositoryApplicationService.addCollaborator(repoId, payloadDto.data(), user));
    }

    @DeleteMapping("/remove-collaborator/{repoId}")
    public ResponseEntity<DisplayRepositoryDto> removeCollaborator(
            @PathVariable Long repoId,
            @RequestParam("username") String username,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(repositoryApplicationService.removeCollaborator(repoId, username, user));
    }
}
