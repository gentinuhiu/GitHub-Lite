package org.example.emt_project.service.domain.impl;

import org.example.emt_project.dto.FileNodeDto;
import org.example.emt_project.model.domain.CodeFile;
import org.example.emt_project.model.domain.Commit;
import org.example.emt_project.model.domain.Repository;
import org.example.emt_project.model.domain.User;
import org.example.emt_project.model.exceptions.FileNotFoundException;
import org.example.emt_project.repository.CodeFileRepository;
import org.example.emt_project.service.domain.CodeFileService;
import org.example.emt_project.service.domain.CommitService;
import org.example.emt_project.service.domain.RepositoryService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileAlreadyExistsException;
import java.util.List;
import java.util.Optional;

@Service
public class CodeFileServiceImpl implements CodeFileService {
    private final CodeFileRepository codeFileRepository;
    private final RepositoryService repositoryService;
    private final CommitService commitService;

    public CodeFileServiceImpl(CodeFileRepository codeFileRepository, RepositoryService repositoryService, CommitService commitService) {
        this.codeFileRepository = codeFileRepository;
        this.repositoryService = repositoryService;
        this.commitService = commitService;
    }

    @Override
    public List<CodeFile> findAll() {
        return codeFileRepository.findAll();
    }

    @Override
    public Optional<CodeFile> findById(Long id) {
        return codeFileRepository.findById(id);
    }

    @Override
    public Optional<CodeFile> update(Long id, CodeFile file) {
        return codeFileRepository.findById(id)
                .map(existingFile -> {
                    existingFile.setName(file.getName());
                    existingFile.setContent(file.getContent());
                    existingFile.setComments(file.getComments());
                    existingFile.setLanguage(file.getLanguage());
                    existingFile.setExtension(file.getExtension());
                    existingFile.setRelativePath(file.getRelativePath());
                    existingFile.setRepository(file.getRepository());
                    return codeFileRepository.save(existingFile);
                });
    }

    @Override
    public Optional<CodeFile> updateContent(Long id, String newContent) {
        return codeFileRepository.findById(id)
                .map(existingFile -> {
                    existingFile.setContent(newContent);
                    return codeFileRepository.save(existingFile);
                });
    }

    @Override
    public CodeFile save(CodeFile file) {
        return codeFileRepository.save(file);
    }

    @Override
    public Optional<CodeFile> deleteById(Long id) {
        Optional<CodeFile> codeFile = findById(id);
        codeFileRepository.deleteById(id);
        return codeFile;

    }


    @Override
    public List<CodeFile> getFilesByRepository(Long id) {
        return codeFileRepository.findByRepositoryId(id);
    }



    @Override
    public String getFileContent(Long fileId) {
        Optional<CodeFile> codeFile = findById(fileId);
        if (codeFile.isEmpty()){
            throw new FileNotFoundException(fileId);
        }
        return codeFile.get().getLanguage();
    }

    @Override
    public String getFileLanguage(Long fileId) {
        Optional<CodeFile> codeFile = findById(fileId);
        if (codeFile.isEmpty()){
            throw new FileNotFoundException(fileId);
        }
        return codeFile.get().getLanguage();
    }

    public Optional<CodeFile> findByName(String name){
        return codeFileRepository.findAll()
                .stream().filter(codeFile -> codeFile.getName().equals(name))
                .findFirst();
    }



    @Override
    public FileNodeDto getRepositoryStructure(Long repositoryId) {
        List<CodeFile> files = codeFileRepository.findByRepositoryId(repositoryId);

        FileNodeDto root = new FileNodeDto("", true);

        for (CodeFile file : files){
            String [] parts = file.getRelativePath().split("/");
            FileNodeDto current = root;

            for (int i=0;i<parts.length;i++){
                String part = parts[i];
                Optional<FileNodeDto> existing = current.getChildren().stream()
                        .filter(f -> f.getName().equals(part))
                        .findFirst();

                if (existing.isPresent()){
                    current = existing.get();
                } else {
                    boolean isDirectory = (i != parts.length - 1);
                    FileNodeDto fileNodeDto = new FileNodeDto(part,isDirectory);
                    current.getChildren().add(fileNodeDto);
                    current = fileNodeDto;
                }
            }
        }

        return root;
    }

    @Override
    public ByteArrayResource getFileForDownload(Repository repository, String path) {

        CodeFile codeFile = getFileInRepository(repository, path);
//        CodeFile codeFile = findById(id).orElseThrow(() -> new RuntimeException("File not found with id: " + id));

        byte [] data = codeFile.getContent().getBytes(StandardCharsets.UTF_8);
        return new ByteArrayResource(data){
            @Override
            public String getFilename() {
                return codeFile.getName();
            }
        };
    }

    @Override
    public CodeFile getFileInRepository(Repository repository, String path) {
        return repository.getFiles().stream().filter(f -> f.getRelativePath().equals(path)).findFirst().orElseThrow();
    }

    @Override
    public CodeFile uploadFile(Long repoId, String path, MultipartFile file, User user) throws IOException {
        Repository repository = repositoryService.findById(repoId).orElseThrow(() -> new FileNotFoundException(repoId));
        String fieldName = file.getName();
        String original = file.getOriginalFilename();
        String contentType = file.getContentType();
        boolean looksText = contentType != null && (
                contentType.startsWith("text/") ||
                        contentType.equals("application/json") ||
                        contentType.equals("application/xml")
        );

        String textContent = null;
        byte[] bytes = file.getBytes();
        if (looksText) {
            textContent = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
        }

        CodeFile codeFile = new CodeFile(original, path + (path.isEmpty() ? "" : "/") + original, ".java", "cpp", textContent, repository);
//        save(codeFile);
        Commit commit = new Commit("uploaded file " + original + (path.isEmpty() ? "" : (" in " + path)), user);
        commitService.save(commit);
        repository.getCommits().add(commit);
        repositoryService.save(repository);
        return save(codeFile);
    }
}
