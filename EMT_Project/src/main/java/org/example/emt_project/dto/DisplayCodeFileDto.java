package org.example.emt_project.dto;


import org.example.emt_project.model.domain.CodeComment;
import org.example.emt_project.model.domain.CodeFile;
import org.example.emt_project.model.domain.Repository;

import java.util.List;
import java.util.stream.Collectors;

public record DisplayCodeFileDto(
        Long id,
        String name,
        String relativePath,
        String extension,
        String language,
        String content
//        Repository repository
//        List<CodeComment> comments

) {

    public static DisplayCodeFileDto from(CodeFile codeFile){
        return new DisplayCodeFileDto(
                codeFile.getId(),
                codeFile.getName(),
                codeFile.getRelativePath(),
                codeFile.getExtension(),
                codeFile.getLanguage(),
                codeFile.getContent()
//                codeFile.getRepository()
//                codeFile.getComments()
        );
    }

    public static List<DisplayCodeFileDto> from(List<CodeFile> codeFiles){
        return codeFiles.stream()
                .map(DisplayCodeFileDto::from)
                .collect(Collectors.toList());
    }

    public CodeFile toCodeFile(Repository repository){
        return new CodeFile(name,relativePath,extension,language,content, repository);
    }
}
