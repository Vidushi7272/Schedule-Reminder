package com.vidushi.schedulereminder.Service;

import com.vidushi.schedulereminder.Module.Subject;
import com.vidushi.schedulereminder.Repository.SubjectRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubjectService {
    private final SubjectRepo repo;
    SubjectService(SubjectRepo repo){
        this.repo=repo;
    }
    public Subject addNew(Subject s){
        return repo.save(s);
    }
    public void deleteAll(){
        repo.deleteAll();
    }
    public void delete(Long id){
        repo.findById(id).orElseThrow(()-> new EntityNotFoundException("Subject not found!"));
        repo.deleteById(id);
    }
    public List<Subject> view(){
        return repo.findAll();
    }
    public Subject edit( Subject s, Long id){
        Subject subject = repo.findById(id).orElseThrow(()->new EntityNotFoundException("Subject Not Found"));
        subject.setTitle(s.getTitle());
        subject.setColor(s.getColor());
        return repo.save(subject);
    }
}
