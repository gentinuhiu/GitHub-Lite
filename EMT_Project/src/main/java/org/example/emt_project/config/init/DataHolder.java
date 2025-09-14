package org.example.emt_project.config.init;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataHolder {

    public DataHolder(){
    }

    // On application startup, initialize the categories list
    // On each startup, the list will be initialized with the same values and the previous values will be lost
    @Transactional
    @PostConstruct
    public void init() {

    }
}
