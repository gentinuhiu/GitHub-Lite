package org.example.emt_project.service.domain.impl;

import org.example.emt_project.model.domain.Commit;
import org.example.emt_project.repository.CommitRepository;
import org.example.emt_project.service.domain.CommitService;
import org.springframework.stereotype.Service;

@Service
public class CommitServiceImpl implements CommitService {
    private final CommitRepository commitRepository;

    public CommitServiceImpl(CommitRepository commitRepository) {
        this.commitRepository = commitRepository;
    }

    @Override
    public Commit save(Commit commit) {
        return commitRepository.save(commit);
    }
}
