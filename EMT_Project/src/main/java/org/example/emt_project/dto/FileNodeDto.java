package org.example.emt_project.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class FileNodeDto {
    private String name;
    private boolean isDirectory;
    private List<FileNodeDto> children;

    public FileNodeDto(String name, boolean isDirectory) {
        this.name = name;
        this.isDirectory = isDirectory;
        this.children = new ArrayList<>();
    }

    public String getName() {
        return name;
    }

    public List<FileNodeDto> getChildren() {
        return children;
    }

}
