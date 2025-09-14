package org.example.emt_project.model.exceptions;

public class FileNotFoundException extends RuntimeException{
    public FileNotFoundException(Long id){
        super(String.format("File with id: %d was not found", id));
    }
}
