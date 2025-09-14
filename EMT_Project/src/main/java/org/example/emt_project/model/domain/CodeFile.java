package org.example.emt_project.model.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Getter
@Setter
public class CodeFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String relativePath;
    private String extension;
    private String language;

    @Lob
    private String content;

    @Lob
    private byte [] data;

    @ManyToOne(fetch = FetchType.LAZY)
    private Repository repository;

    @OneToMany(mappedBy = "file")
    private List<CodeComment> comments;

    public CodeFile() {
    }

    public CodeFile(String name, String relativePath, String extension, String language, String content, Repository repository) {
        this.name = name;
        this.relativePath = relativePath;
        this.extension = extension;
        this.language = language;
        this.content = content;
        this.repository = repository;
        this.comments = new ArrayList<>();
    }

    public CodeFile(String name, String content, String relativePath) {
        this.name = name;
        this.relativePath = relativePath;
        this.content = content;

    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRelativePath() {
        return relativePath;
    }

    public void setRelativePath(String relativePath) {
        this.relativePath = relativePath;
    }

    public String getExtension() {
        return extension;
    }

    public void setExtension(String extension) {
        this.extension = extension;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Repository getRepository() {
        return repository;
    }

    public void setRepository(Repository repository) {
        this.repository = repository;
    }

    public List<CodeComment> getComments() {
        return comments;
    }

    public void setComments(List<CodeComment> comments) {
        this.comments = comments;
    }

    public byte[] getData() {
        return data;
    }

    public void setData(byte[] data) {
        this.data = data;
    }
}
