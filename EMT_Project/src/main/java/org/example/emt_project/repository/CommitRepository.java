package org.example.emt_project.repository;

import org.example.emt_project.model.domain.Commit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommitRepository extends JpaRepository<Commit, Long> {
}
