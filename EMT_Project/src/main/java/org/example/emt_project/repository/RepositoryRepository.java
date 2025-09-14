package org.example.emt_project.repository;

import org.example.emt_project.model.domain.Repository;
import org.example.emt_project.model.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

@org.springframework.stereotype.Repository
public interface RepositoryRepository extends JpaRepository<Repository, Long> {
    List<Repository> findByNameContainingIgnoreCase(String repoName);

    List<Repository> findAllByOwnerUsername(String username);
}
