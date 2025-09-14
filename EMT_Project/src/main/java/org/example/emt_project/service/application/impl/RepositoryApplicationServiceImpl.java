package org.example.emt_project.service.application.impl;

import org.example.emt_project.dto.*;
import org.example.emt_project.model.domain.CodeFile;
import org.example.emt_project.model.domain.Commit;
import org.example.emt_project.model.domain.Repository;
import org.example.emt_project.model.domain.User;
import org.example.emt_project.model.exceptions.FileNotFoundException;
import org.example.emt_project.service.application.RepositoryApplicationService;
import org.example.emt_project.service.domain.CodeFileService;
import org.example.emt_project.service.domain.CommitService;
import org.example.emt_project.service.domain.RepositoryService;
import org.example.emt_project.service.domain.UserService;
import org.example.emt_project.service.domain.impl.InMemoryZip;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RepositoryApplicationServiceImpl implements RepositoryApplicationService {

    private final RepositoryService repositoryService;
    private final CodeFileService codeFileService;
    private final UserService userService;
    private final CommitService commitService;

    public RepositoryApplicationServiceImpl(RepositoryService repositoryService, CodeFileService codeFileService, UserService userService, CommitService commitService) {
        this.repositoryService = repositoryService;
        this.codeFileService = codeFileService;
        this.userService = userService;
        this.commitService = commitService;
    }

    @Override
    public List<DisplayRepositoryDto> findAll() {
        return repositoryService.findAll().stream().map(DisplayRepositoryDto::from).collect(Collectors.toList());
    }

    @Override
    public Optional<DisplayRepositoryDto> findById(Long id) {
        return repositoryService.findById(id)
                .map(DisplayRepositoryDto::from);
    }

    @Override
    public Optional<DisplayRepositoryDto> update(Long id, CreateRepositoryDto createRepositoryDto, User user) {
        return repositoryService.update(id,createRepositoryDto.toRepository(), user)
                .map(DisplayRepositoryDto::from);
    }

    @Override
    public DisplayRepositoryDto save(CreateRepositoryDto createRepositoryDto, User user) {
        Commit commit = new Commit("created repository", user);
        commitService.save(commit);
        return DisplayRepositoryDto.from(repositoryService.save(createRepositoryDto.toRepository(), user.getUsername(), commit));
//        return DisplayRepositoryDto.from(createRepositoryDto.toRepository());
    }

    @Override
    public Optional<DisplayRepositoryDto> deleteById(Long id) {
        Optional<DisplayRepositoryDto> repository = findById(id);
        repositoryService.deleteById(id);
        return repository;
    }

    @Override
    public List<DisplayRepositoryDto> findByName(String name) {
        return DisplayRepositoryDto.from(repositoryService.findByName(name));

    }

    @Override
    public DisplayRepositoryDto uploadRepository(MultipartFile file, String username) throws IOException {
        if (!file.getOriginalFilename().endsWith(".zip")) {
            throw new IllegalArgumentException("This is not zip file");
        }

        List<CodeFile> files = repositoryService.unzipFiles(file.getInputStream());

        Repository repository = repositoryService.
                createRepositoryFromFiles(file.getOriginalFilename().replace(".zip", ""),files);

        repository.setZipData(file.getBytes());
//        User user = userService.findByUsername(username).orElseThrow();
//        repository.setOwner(user);
//        repository.setCreatedAt(LocalDateTime.now());
//        repository.setPublic(true);
        User user = userService.findByUsername(username).orElseThrow();
        Commit commit = new Commit("uploaded repository " + repository.getName(), user);
        commitService.save(commit);

        Repository saved = repositoryService.save(repository, username, commit);


        for (CodeFile codeFile : repository.getFiles()){
            codeFileService.save(codeFile);
        }

        return DisplayRepositoryDto.from(saved);
    }

    @Override
    public ByteArrayResource getRepoDataForDownload(Long id) {
        return repositoryService.getRepoFile(id);
    }

    @Override
    public List<DisplayRepositoryDto> findByOwnerUsername(String username) {
        return DisplayRepositoryDto.from(repositoryService.findByOwnerUsername(username));
    }

    @Override
    public DisplayUserDto identify(Long repo, String username) {
        User user = userService.findByUsername(username).orElseThrow();
        Repository repository = repositoryService.findById(repo).orElseThrow(() -> new FileNotFoundException(repo));
        boolean ownProfile = repository.getOwner().getUsername().equals(user.getUsername()) ||
                repository.getCollaborators().stream().anyMatch(c -> c.getUsername().equals(username));
        return DisplayUserDto.from(DisplayUserDto.from(user), ownProfile);
    }

    @Override
    public DisplayRepositoryDto uploadDirectory(Long repoId, String path, MultipartFile archive, User user) throws IOException {
        if (!archive.getOriginalFilename().endsWith(".zip")) {
            throw new IllegalArgumentException("This is not zip file");
        }
        Repository repository = repositoryService.findById(repoId).orElseThrow(() -> new FileNotFoundException(repoId));

        byte[] original = repository.getZipData();
        byte[] uploads = archive.getBytes();

        List<CodeFile> files = repositoryService.unzipFiles(archive.getInputStream());
        List<CodeFile> adjustedCodeFiles = repositoryService.adjustCodeFiles(repository, files, path);

        adjustedCodeFiles.forEach(codeFileService::save);
        repository.getFiles().addAll(adjustedCodeFiles);

        byte[] updated = InMemoryZip.mergeZipUnderPrefix(
                original,
                uploads,
                path,               // prefix inside base ("" for root)
                /* overwrite = */ true
        );
        repository.setZipData(updated);

        Commit commit = new Commit("uploaded directory at " + (path.isEmpty() ? "/" : path), user);
        commitService.save(commit);
        repository.getCommits().add(commit);

        return DisplayRepositoryDto.from(repositoryService.save(repository));
    }

    @Override
    public List<DisplayCommitDto> getCommits(Long repo) {
        Repository repository = repositoryService.findById(repo).orElseThrow(() -> new FileNotFoundException(repo));
        return DisplayCommitDto.from(repository.getCommits().reversed());
    }

    @Override
    public DisplayRepositoryDto deleteDirectory(Long repoId, String path, User user) {
        Repository repository = repositoryService.findById(repoId).orElseThrow(() -> new FileNotFoundException(repoId));
        List<CodeFile> codeFiles = repository.getFiles();

        List<CodeFile> toBeRemoved = codeFiles.stream().filter(cf -> cf.getRelativePath().startsWith(path)).toList();
        repository.getFiles().removeAll(toBeRemoved);
        toBeRemoved.forEach(cf -> codeFileService.deleteById(cf.getId()));

        Commit commit = new Commit("deleted directory " + path, user);
        commitService.save(commit);
        repository.getCommits().add(commit);

        return DisplayRepositoryDto.from(repositoryService.save(repository));
    }

    @Override
    public DisplayRepositoryDto deleteFile(Long repoId, String path, User user) {
        Repository repository = repositoryService.findById(repoId).orElseThrow(() -> new FileNotFoundException(repoId));
        List<CodeFile> codeFiles = repository.getFiles();

        CodeFile codeFile = codeFiles.stream().filter(cf -> cf.getRelativePath().equals(path)).findFirst().orElse(null);
        if(codeFile == null)
            return null;

        repository.getFiles().remove(codeFile);
        codeFileService.deleteById(codeFile.getId());

        Commit commit = new Commit("deleted file " + path, user);
        commitService.save(commit);
        repository.getCommits().add(commit);

        return DisplayRepositoryDto.from(repositoryService.save(repository));
    }

    @Override
    public DisplayRepositoryDto addCollaborator(Long repoId, String username, User actionUser) {
        User user = userService.findByUsername(username).orElseThrow();
        Repository repository = repositoryService.findById(repoId).orElseThrow(() -> new FileNotFoundException(repoId));
        repository.getCollaborators().add(user);

        Commit commit = new Commit("added " + username + " as collaborator", actionUser);
        commitService.save(commit);
        repository.getCommits().add(commit);
        return DisplayRepositoryDto.from(repositoryService.save(repository));
    }

    @Override
    public List<DisplaySearchUserDto> getCollaborators(Long repo) {
        return DisplaySearchUserDto.from(repositoryService.findById(repo).orElseThrow().getCollaborators());
    }

    @Override
    public List<DisplayRepositoryDto> findPublicByUsername(String username) {
        return DisplayRepositoryDto.from(repositoryService.findByOwnerUsername(username)
                .stream().filter(Repository::isPublic).toList());
    }

    @Override
    public DisplayRepositoryDto removeCollaborator(Long repoId, String username, User actionUser) {
        Repository repository = repositoryService.findById(repoId).orElseThrow(() -> new FileNotFoundException(repoId));
        repository.getCollaborators().removeIf(c -> c.getUsername().equals(username));

        Commit commit = new Commit("removed " + username + " as collaborator", actionUser);
        commitService.save(commit);
        repository.getCommits().add(commit);

        return DisplayRepositoryDto.from(repositoryService.save(repository));
    }
}
