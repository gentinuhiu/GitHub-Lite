package org.example.emt_project.service.domain;

import org.example.emt_project.model.domain.CodeFile;
import org.example.emt_project.model.domain.Commit;
import org.example.emt_project.model.domain.Repository;
import org.example.emt_project.model.domain.User;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;

public interface RepositoryService {

    List<Repository> findAll();

    Optional<Repository> findById(Long id);

    Optional<Repository> update(Long id, Repository repository, User user);

    Repository save(Repository repository, String username, Commit commit);

    Optional<Repository> deleteById(Long id);

    List<Repository> findByName(String repoName);

    Repository createRepositoryFromFiles(String repoName, List<CodeFile> codeFiles);

    List<CodeFile> unzipFiles(InputStream inputStream) throws IOException;

    ByteArrayResource getRepoFile(Long id);

    Repository save(Repository repository);
    
    List<Repository> findByOwnerUsername(String username);

    List<CodeFile> adjustCodeFiles(Repository repository, List<CodeFile> files, String path);
}
