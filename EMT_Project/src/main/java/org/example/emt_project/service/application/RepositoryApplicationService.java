package org.example.emt_project.service.application;

import org.example.emt_project.dto.*;
import org.example.emt_project.model.domain.Repository;
import org.example.emt_project.model.domain.User;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.channels.FileChannel;
import java.util.List;
import java.util.Optional;

public interface RepositoryApplicationService {
    List<DisplayRepositoryDto> findAll();

    Optional<DisplayRepositoryDto> findById(Long id);

    Optional<DisplayRepositoryDto> update(Long id, CreateRepositoryDto createRepositoryDto, User user);

    DisplayRepositoryDto save(CreateRepositoryDto createRepositoryDto, User user);

    Optional<DisplayRepositoryDto> deleteById(Long id);

    List<DisplayRepositoryDto> findByName(String name);

    DisplayRepositoryDto uploadRepository(MultipartFile file, String username) throws IOException;

    ByteArrayResource getRepoDataForDownload(Long id);

    List<DisplayRepositoryDto> findByOwnerUsername(String username);

    DisplayUserDto identify(Long repo, String username);

    DisplayRepositoryDto uploadDirectory(Long repoId, String path, MultipartFile archive, User user) throws IOException;

    List<DisplayCommitDto> getCommits(Long repo);

    DisplayRepositoryDto deleteDirectory(Long repoId, String path, User user);

    DisplayRepositoryDto deleteFile(Long repoId, String path, User user);

    DisplayRepositoryDto addCollaborator(Long repoId, String username, User actionUser);

    List<DisplaySearchUserDto> getCollaborators(Long repo);

    List<DisplayRepositoryDto> findPublicByUsername(String username);

    DisplayRepositoryDto removeCollaborator(Long repoId, String username, User user);
}
