package org.example.emt_project.web.controllers;

import jakarta.validation.constraints.NotNull;
import org.example.emt_project.dto.CreateCodeFileDto;
import org.example.emt_project.dto.DisplayCodeFileDto;
import org.example.emt_project.dto.FileNodeDto;
import org.example.emt_project.model.domain.CodeFile;
import org.example.emt_project.model.domain.User;
import org.example.emt_project.service.application.CodeFileApplicationService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/api/code-files")
public class CodeFileController {
    private final CodeFileApplicationService codeFileApplicationService;

    public CodeFileController(CodeFileApplicationService codeFileApplicationService) {
        this.codeFileApplicationService = codeFileApplicationService;
    }

    @GetMapping
    public List<DisplayCodeFileDto> findAll(){
        return codeFileApplicationService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DisplayCodeFileDto> findById(@PathVariable Long id){
        return codeFileApplicationService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/add")
    public ResponseEntity<DisplayCodeFileDto> save(@RequestBody CreateCodeFileDto createCodeFileDto){
        return ResponseEntity.ok(codeFileApplicationService.save(createCodeFileDto));
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<DisplayCodeFileDto> update(@PathVariable Long id, @RequestBody CreateCodeFileDto createCodeFileDto){
        return codeFileApplicationService.update(id,createCodeFileDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/update-content/{id}")
    public ResponseEntity<DisplayCodeFileDto> updateContent(@PathVariable Long id, @RequestBody CreateCodeFileDto createCodeFileDto){
        return codeFileApplicationService.updateContent(id, createCodeFileDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<DisplayCodeFileDto> delete(@PathVariable Long id){
        return codeFileApplicationService.deleteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/filter-by-repository/{id}")
    public ResponseEntity<List<DisplayCodeFileDto>> getFilesByRepository(@PathVariable Long id) {
        return ResponseEntity.ok(codeFileApplicationService.getFilesByRepository(id));
    }

    @GetMapping("/filter-by-name/{name}")
    public ResponseEntity<CodeFile> findCodeFileByName(@PathVariable String name){
        return codeFileApplicationService.findByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/structure/{repository_id}")
    public ResponseEntity<FileNodeDto> getRepositoryStructure(@PathVariable Long repository_id){
        return ResponseEntity.ok(codeFileApplicationService.getRepositoryStructure(repository_id));
    }

    @GetMapping("/file/{repo}")
    public ResponseEntity<DisplayCodeFileDto> getFile(@PathVariable Long repo, @RequestParam String path){
        return ResponseEntity.ok(codeFileApplicationService.getFileInRepository(repo, path));
    }

    @GetMapping("/download/{repo}")
    public ResponseEntity<ByteArrayResource> downloadFile(@PathVariable Long repo, @RequestParam String path){
        ByteArrayResource file = codeFileApplicationService.getFileDataForDownload(repo, path);
        return ResponseEntity.ok()
                .contentLength(file.contentLength())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + file.getFilename() + "\"")
                .body(file);

    }

    @PostMapping(value = "/upload/{repoId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadFile(
            @PathVariable Long repoId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "path", required = false, defaultValue = "") String path,
            @AuthenticationPrincipal User user
    ) throws Exception {

        // service should handle auth/ownership checks & storage
        codeFileApplicationService.uploadFile(repoId, path, file, user);

        // Location header that points to the "get file by relativePath" endpoint (adjust to your route)
//        var location = ServletUriComponentsBuilder.fromCurrentContextPath()
//                .path("/api/repositories/{repoId}/file")
//                .queryParam("relativePath", saved.relativePath())
//                .buildAndExpand(repoId)
//                .toUri();

        return ResponseEntity.ok().build();
    }
}
