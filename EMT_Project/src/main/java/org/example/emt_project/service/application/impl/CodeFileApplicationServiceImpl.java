package org.example.emt_project.service.application.impl;

import org.example.emt_project.dto.CreateCodeFileDto;
import org.example.emt_project.dto.DisplayCodeFileDto;
import org.example.emt_project.dto.FileNodeDto;
import org.example.emt_project.model.domain.CodeFile;
import org.example.emt_project.model.domain.Repository;
import org.example.emt_project.model.domain.User;
import org.example.emt_project.model.exceptions.FileNotFoundException;
import org.example.emt_project.service.application.CodeFileApplicationService;
import org.example.emt_project.service.domain.CodeFileService;
import org.example.emt_project.service.domain.RepositoryService;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.repository.core.RepositoryCreationException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CodeFileApplicationServiceImpl implements CodeFileApplicationService {

    private final CodeFileService codeFileService;
    private final RepositoryService repositoryService;

    public CodeFileApplicationServiceImpl(CodeFileService codeFileService, RepositoryService repositoryService) {
        this.codeFileService = codeFileService;
        this.repositoryService = repositoryService;
    }

    @Override
    public List<DisplayCodeFileDto> findAll() {
        return codeFileService.findAll().stream().map(DisplayCodeFileDto::from).collect(Collectors.toList());
    }

    @Override
    public Optional<DisplayCodeFileDto> findById(Long id) {
        return codeFileService.findById(id).map(DisplayCodeFileDto::from);
    }

    @Override
    public Optional<DisplayCodeFileDto> update(Long id, CreateCodeFileDto createCodeFileDto) {
        Optional<Repository> repository = repositoryService.findById(createCodeFileDto.repositoryId());
        return codeFileService.update(id, createCodeFileDto.toCodeFile(repository.orElse(null)))
                .map(DisplayCodeFileDto::from);
    }

    @Override
    public Optional<DisplayCodeFileDto> updateContent(Long id, CreateCodeFileDto createCodeFileDto) {
        return codeFileService.updateContent(id,createCodeFileDto.content())
                .map(DisplayCodeFileDto::from);
    }

    @Override
    public DisplayCodeFileDto save(CreateCodeFileDto createCodeFileDto) {
        Repository repository = repositoryService.findById(createCodeFileDto.repositoryId()).orElseThrow(() -> new FileNotFoundException(createCodeFileDto.repositoryId()));
        return DisplayCodeFileDto.from(codeFileService.save(createCodeFileDto.toCodeFile(repository)));
    }

    @Override
    public ByteArrayResource getFileDataForDownload(Long id, String path) {
        Repository repository = repositoryService.findById(id).orElseThrow(()-> new FileNotFoundException(id));
        return codeFileService.getFileForDownload(repository, path);
    }

    @Override
    public Optional<DisplayCodeFileDto> deleteById(Long id) {
        return codeFileService.deleteById(id)
                .map(DisplayCodeFileDto::from);
    }


    @Override
    public List<DisplayCodeFileDto> getFilesByRepository(Long id) {
        return DisplayCodeFileDto.from(codeFileService.getFilesByRepository(id));
    }

    @Override
    public Optional<CodeFile> findByName(String name) {
        return codeFileService.findByName(name);
    }

    @Override
    public FileNodeDto getRepositoryStructure(Long repositoryId) {
        return codeFileService.getRepositoryStructure(repositoryId);
    }

    @Override
    public DisplayCodeFileDto getFileInRepository(Long repo, String path) {
        Repository repository = repositoryService.findById(repo).orElseThrow(() -> new FileNotFoundException(repo));
        return DisplayCodeFileDto.from(codeFileService.getFileInRepository(repository, path));
    }

    @Override
    public DisplayCodeFileDto uploadFile(Long repoId, String path, MultipartFile file, User user) throws Exception {
        return DisplayCodeFileDto.from(codeFileService.uploadFile(repoId, path, file, user));
    }
}
