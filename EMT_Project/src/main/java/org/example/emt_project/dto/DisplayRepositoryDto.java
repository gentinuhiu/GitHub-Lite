package org.example.emt_project.dto;

import org.example.emt_project.model.domain.CodeFile;
import org.example.emt_project.model.domain.Repository;
import org.example.emt_project.model.enumerations.PROGRAMMING_LANGUAGE;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public record DisplayRepositoryDto(
        Long id,
        String name,
        String description,
        String localPath,
        PROGRAMMING_LANGUAGE programmingLanguage,
        boolean isPublic,
        LocalDateTime createdAt
) {

    public static DisplayRepositoryDto from(Repository repository){
        return new DisplayRepositoryDto(
                repository.getId(),
                repository.getName(),
                repository.getDescription(),
                repository.getLocalPath(),
                repository.getProgrammingLanguage(),
                repository.isPublic(),
                repository.getCreatedAt());
//                DisplayCodeFileDto.from(repository.getFiles()));

    }
    public static List<DisplayRepositoryDto> from(List<Repository> repositories) {
        return repositories.stream()
                .map(DisplayRepositoryDto::from)
                .collect(Collectors.toList());
    }
}
