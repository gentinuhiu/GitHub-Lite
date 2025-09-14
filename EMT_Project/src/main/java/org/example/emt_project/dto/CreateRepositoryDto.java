package org.example.emt_project.dto;

import org.example.emt_project.model.domain.CodeFile;
import org.example.emt_project.model.domain.Repository;
import org.example.emt_project.model.enumerations.PROGRAMMING_LANGUAGE;

import java.util.List;
import java.util.stream.Collectors;

public record CreateRepositoryDto(
        String name,
        String description,
        String localPath,
        boolean isPublic
//        List<CodeFile> codeFiles
) {

    public static CreateRepositoryDto from(Repository repository){
        return new CreateRepositoryDto(
                repository.getName(),
                repository.getDescription(),
                repository.getLocalPath(),
                repository.isPublic());
//                repository.getFiles());
    }

    public static List<CreateRepositoryDto> from(List<Repository> repositories){
        return repositories.stream().map(CreateRepositoryDto::from).collect(Collectors.toList());
    }

    public Repository toRepository(){
        return new Repository(name,description,localPath, isPublic);
    }
}
