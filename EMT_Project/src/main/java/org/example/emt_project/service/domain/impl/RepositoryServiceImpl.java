package org.example.emt_project.service.domain.impl;

import org.example.emt_project.model.domain.CodeFile;
import org.example.emt_project.model.domain.Commit;
import org.example.emt_project.model.domain.Repository;
import org.example.emt_project.model.domain.User;
import org.example.emt_project.repository.RepositoryRepository;
import org.example.emt_project.service.domain.CommitService;
import org.example.emt_project.service.domain.RepositoryService;
import org.example.emt_project.service.domain.UserService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@Service
public class RepositoryServiceImpl implements RepositoryService {
    private final RepositoryRepository repositoryRepository;
    private final UserService userService;
    private final CommitService commitService;

    public RepositoryServiceImpl(RepositoryRepository repositoryRepository, UserService userService, CommitService commitService) {
        this.repositoryRepository = repositoryRepository;
        this.userService = userService;
        this.commitService = commitService;
    }

    @Override
    public List<Repository> findAll() {
        return repositoryRepository.findAll();
    }

    @Override
    public Optional<Repository> findById(Long id) {
        return repositoryRepository.findById(id);
    }

    @Override
    public Optional<Repository> update(Long id, Repository repository, User user) {
        List<Commit> commits = new ArrayList<>();
        return repositoryRepository.findById(id)
                .map(existingRepository -> {

                    if(!existingRepository.getName().equals(repository.getName())) {
                        existingRepository.setName(repository.getName());
                        commits.add(new Commit("changed repository name to " + repository.getName(), user));
                    }

                    if(!existingRepository.getDescription().equals(repository.getDescription())) {
                        existingRepository.setDescription(repository.getDescription());
                        commits.add(new Commit("changed repository description", user));
                    }

                    if(existingRepository.isPublic() != repository.isPublic()) {
                        existingRepository.setPublic(repository.isPublic());
                        commits.add(new Commit("set repository to " + (repository.isPublic() ? "public" : "private"), user));
                    }

                    commits.forEach(commitService::save);
                    commits.forEach(existingRepository.getCommits()::add);
//                    existingRepository.setLocalPath(repository.getLocalPath());
//                    existingRepository.setFiles(repository.getFiles());
                    return repositoryRepository.save(existingRepository);
                });
    }

    @Override
    public Repository save(Repository repository, String username, Commit commit) {
        User user = userService.findByUsername(username).orElseThrow();
        repository.setOwner(user);
        repository.setCreatedAt(LocalDateTime.now());
        repository.getCommits().add(commit);
        return repositoryRepository.save(repository);
    }

    @Override
    public Optional<Repository> deleteById(Long id) {
        Optional<Repository> repostiory = findById(id);
        repositoryRepository.deleteById(id);
        return repostiory;
    }

    @Override
    public List<Repository> findByName(String repoName) {
        return repositoryRepository.findByNameContainingIgnoreCase(repoName);
    }

    @Override
    public Repository createRepositoryFromFiles(String repoName, List<CodeFile> codeFiles) {
        Repository repository = new Repository();

        repository.setName(repoName);

        for (CodeFile file : codeFiles){
            CodeFile codeFile1 = new CodeFile();
            codeFile1.setName(file.getName());
            codeFile1.setExtension(file.getExtension());
            codeFile1.setRelativePath(file.getRelativePath());
            codeFile1.setRepository(repository);

//            if (isTextFile(file.getName())){
//                codeFile1.setContent(file.getContent());
//            }

//            codeFile1.setData(file.getData());
            codeFile1.setContent(file.getContent());

            repository.addCodeFile(codeFile1);

        }

        return repository;
    }

    @Override
    public List<CodeFile> unzipFiles(InputStream inputStream) throws IOException {
        List<CodeFile> files = new ArrayList<>();

        try (ZipInputStream zis = new ZipInputStream(inputStream)) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null){
                if (entry.isDirectory()) continue;

                ByteArrayOutputStream baos = new ByteArrayOutputStream();

                byte [] buffer = new byte[1024];
                int length;

                while ((length = zis.read(buffer)) > 0){
                    baos.write(buffer,0,length);
                }

                String content = baos.toString(StandardCharsets.UTF_8);
                String relativePath = entry.getName();
                String fileName = Paths.get(relativePath).getFileName().toString();
                files.add(new CodeFile(fileName,content,relativePath));
            }



        }

        return files;

    }

    @Override
    public ByteArrayResource getRepoFile(Long id) {
        Repository repository = findById(id)
                .orElseThrow(() -> new RuntimeException("Repository is not founded"));
        byte [] data = repository.getZipData();

        if (data == null || data.length == 0){
            throw new RuntimeException("File is empty in database: " + repository.getName());
        } return new ByteArrayResource(data) {
            @Override public String getFilename() { //
                // return repository.getName().endsWith(".zip") ?
//                repository.getName() : repository.getName() + ".zip";
                return repository.getName() + ".zip";
            }
        };
    }

    private byte[] buildZipBytesFromFs(Long repoId) throws IOException {
        Path root = Paths.get("./data/repos").resolve(String.valueOf(repoId)).normalize(); // <- keep in sync with your storageRoot
        Files.createDirectories(root);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            Files.walkFileTree(root, new SimpleFileVisitor<Path>() {
                @Override
                public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                    if (!dir.equals(root)) {
                        String rel = root.relativize(dir).toString().replace("\\", "/");
                        if (!rel.endsWith("/")) rel += "/";
                        zos.putNextEntry(new ZipEntry(rel));   // keep empty directories
                        zos.closeEntry();
                    }
                    return FileVisitResult.CONTINUE;
                }
                @Override
                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                    String rel = root.relativize(file).toString().replace("\\", "/");
                    zos.putNextEntry(new ZipEntry(rel));
                    Files.copy(file, zos);
                    zos.closeEntry();
                    return FileVisitResult.CONTINUE;
                }
            });
        }
        return baos.toByteArray();
    }


    @Override
    public Repository save(Repository repository) {
        return repositoryRepository.save(repository);
    }

    @Override
    public List<Repository> findByOwnerUsername(String username) {
        return repositoryRepository.findAllByOwnerUsername(username);
    }

    @Override
    public List<CodeFile> adjustCodeFiles(Repository repository, List<CodeFile> files, String path) {
        List<CodeFile> adjustedFiles = new ArrayList<>();
        for (CodeFile file : files) {
            CodeFile codeFile1 = new CodeFile();
            codeFile1.setName(file.getName());
            codeFile1.setExtension(file.getExtension());
            codeFile1.setRelativePath(path + (path.isEmpty() ? "" : "/") + file.getRelativePath());
            codeFile1.setContent(file.getContent());
            codeFile1.setRepository(repository);
            adjustedFiles.add(codeFile1);
        }
        return adjustedFiles;
    }
}
