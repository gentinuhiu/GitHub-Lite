package org.example.emt_project.dto;

import org.example.emt_project.model.domain.Commit;

import java.time.LocalDateTime;
import java.util.List;

public record DisplayCommitDto(String author, String name, LocalDateTime commitDate) {
    public static DisplayCommitDto from(Commit commit) {
        return new DisplayCommitDto(commit.getAuthor().getUsername(), commit.getName(), commit.getCommitDate());
    }
    public static List<DisplayCommitDto> from(List<Commit> commitList){
        return commitList.stream().map(DisplayCommitDto::from).toList();
    }
}
