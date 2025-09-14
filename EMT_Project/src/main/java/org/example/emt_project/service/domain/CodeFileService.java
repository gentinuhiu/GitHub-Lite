package org.example.emt_project.service.domain;

import org.example.emt_project.dto.FileNodeDto;
import org.example.emt_project.model.domain.CodeFile;
import org.example.emt_project.model.domain.Repository;
import org.example.emt_project.model.domain.User;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public interface CodeFileService {

    List<CodeFile> findAll();

    Optional<CodeFile> findById(Long id);
    Optional<CodeFile> update(Long id, CodeFile file);

    Optional<CodeFile> updateContent(Long id, String newContent);

    CodeFile save(CodeFile file);

    Optional<CodeFile> deleteById(Long id);

    List<CodeFile> getFilesByRepository(Long id);


    String getFileContent(Long fileId);

    String getFileLanguage(Long fileId);

    Optional<CodeFile> findByName(String name);


    FileNodeDto getRepositoryStructure(Long repositoryId);


    ByteArrayResource getFileForDownload(Repository repository, String path);

    CodeFile getFileInRepository(Repository repository, String path);

    CodeFile uploadFile(Long repoId, String path, MultipartFile file, User user) throws Exception;
}
