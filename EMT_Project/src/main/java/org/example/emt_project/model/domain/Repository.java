package org.example.emt_project.model.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import org.example.emt_project.model.enumerations.PROGRAMMING_LANGUAGE;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Data
@Table(name="repository")
public class Repository {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    @Lob
    @Column(name = "zip_data")
    private byte [] zipData;
    private String localPath;
    private PROGRAMMING_LANGUAGE programmingLanguage;
    private LocalDateTime createdAt;
    private boolean isPublic;

    @ManyToOne
    private User owner;
    @ManyToMany(cascade = CascadeType.ALL)
    private List<User> collaborators = new ArrayList<>();

    @OneToMany(mappedBy = "repository", cascade = CascadeType.ALL)
    private List<CodeFile> files = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL)
    private List<Commit> commits = new ArrayList<>();

    public Repository() {
    }

    public Repository(String name, String description, String localPath, boolean isPublic) {
        this.name = name;
        this.description = description;
        this.localPath = localPath;
        this.isPublic = isPublic;
        this.files = new ArrayList<>();
        this.commits = new ArrayList<>();
    }

    public PROGRAMMING_LANGUAGE getProgrammingLanguage() {
        return programmingLanguage;
    }

    public void setProgrammingLanguage(PROGRAMMING_LANGUAGE programmingLanguage) {
        this.programmingLanguage = programmingLanguage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean aPublic) {
        isPublic = aPublic;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public List<User> getCollaborators() {
        return collaborators;
    }

    public void setCollaborators(List<User> collaborators) {
        this.collaborators = collaborators;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setLocalPath(String localPath) {
        this.localPath = localPath;
    }

    public void setFiles(List<CodeFile> files) {
        this.files = files;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getLocalPath() {
        return localPath;
    }

    public List<CodeFile> getFiles() {
        return files;
    }

    public byte[] getZipData() {
        return zipData;
    }

    public void setZipData(byte[] zipData) {
        this.zipData = zipData;
    }

    public List<Commit> getCommits() {
        return commits;
    }

    public void setCommits(List<Commit> commits) {
        this.commits = commits;
    }

    public void addCodeFile(CodeFile file){
        files.add(file);
    }
}
