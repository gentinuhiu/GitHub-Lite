package org.example.emt_project.service.domain;

import org.example.emt_project.model.domain.Commit;
import org.springframework.stereotype.Service;

public interface CommitService {
    Commit save(Commit commit);
}
