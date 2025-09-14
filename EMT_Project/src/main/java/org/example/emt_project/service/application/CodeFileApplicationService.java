package org.example.emt_project.service.application;

import org.example.emt_project.dto.CreateCodeFileDto;
import org.example.emt_project.dto.DisplayCodeFileDto;
import org.example.emt_project.dto.FileNodeDto;
import org.example.emt_project.model.domain.CodeFile;
import org.example.emt_project.model.domain.User;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public interface CodeFileApplicationService {
    List<DisplayCodeFileDto> findAll();

    Optional<DisplayCodeFileDto> findById(Long id);
    Optional<DisplayCodeFileDto> update(Long id, CreateCodeFileDto createCodeFileDto);

    Optional<DisplayCodeFileDto> updateContent(Long id, CreateCodeFileDto createCodeFileDto);

    DisplayCodeFileDto save(CreateCodeFileDto createCodeFileDto);

    ByteArrayResource getFileDataForDownload(Long id, String path);

    Optional<DisplayCodeFileDto> deleteById(Long id);

    List<DisplayCodeFileDto> getFilesByRepository(Long id);

    Optional<CodeFile> findByName(String name);

    FileNodeDto getRepositoryStructure(Long repositoryId);

    DisplayCodeFileDto getFileInRepository(Long repo, String path);

    DisplayCodeFileDto uploadFile(Long repoId, String path, MultipartFile file, User user) throws Exception;

//    String getFileContent(Long fileId);
//
//    String getFileLanguage(Long fileId);
}
