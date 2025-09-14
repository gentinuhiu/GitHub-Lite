package org.example.emt_project.repository;

import org.example.emt_project.model.domain.CodeFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CodeFileRepository extends JpaRepository<CodeFile, Long> {

    List<CodeFile> findByRepositoryId(Long repositoryId);

    Optional<CodeFile> findByName(String name);
}
