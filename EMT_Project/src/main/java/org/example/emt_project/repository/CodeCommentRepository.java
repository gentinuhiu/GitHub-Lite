package org.example.emt_project.repository;

import org.example.emt_project.model.domain.CodeComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CodeCommentRepository extends JpaRepository<CodeComment, Long> {
}
