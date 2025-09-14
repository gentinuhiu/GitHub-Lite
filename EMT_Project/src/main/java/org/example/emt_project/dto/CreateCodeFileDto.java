package org.example.emt_project.dto;

import org.example.emt_project.model.domain.CodeComment;
import org.example.emt_project.model.domain.CodeFile;
import org.example.emt_project.model.domain.Repository;

import java.util.List;
import java.util.stream.Collectors;

public record CreateCodeFileDto(
        String name,
        String relativePath,
        String extension,
        String language,
        String content,
        Long repositoryId
//        List<CodeComment> comments

) {
    public static CreateCodeFileDto from(CodeFile codeFile){
        return new CreateCodeFileDto(codeFile.getName(),
                codeFile.getRelativePath(),
                codeFile.getExtension(),
                codeFile.getLanguage(),
                codeFile.getContent(),
                codeFile.getRepository().getId());
//                codeFile.getComments());
    }

    public static List<CreateCodeFileDto> from(List<CodeFile> codeFiles){
        return codeFiles.stream().map(CreateCodeFileDto::from).collect(Collectors.toList());
    }

    public CodeFile toCodeFile(Repository repository){
        return new CodeFile(name,relativePath,extension,language,content, repository);
    }
}
