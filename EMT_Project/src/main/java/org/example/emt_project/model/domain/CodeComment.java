package org.example.emt_project.model.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class CodeComment {

    @Id
    @GeneratedValue
    private Long id;

    private int lineNumber;

    private String text;

    private LocalDateTime createdAt;

    @ManyToOne
    private CodeFile file;

    @ManyToOne
    private User author;

    public CodeComment() {
    }



    public CodeComment(Long id, int lineNumber, String text, LocalDateTime createdAt, CodeFile file) {
        this.id = id;
        this.lineNumber = lineNumber;
        this.text = text;
        this.createdAt = createdAt;
        this.file = file;
    }


}
