package com.vidushi.schedulereminder.Service;

import com.vidushi.schedulereminder.Module.timeTableEntry;
import com.vidushi.schedulereminder.Repository.SubjectRepo;
import com.vidushi.schedulereminder.Repository.timeTableEntryRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.List;

@Service
public class EntryService {
    timeTableEntryRepo repo;
    SubjectRepo repo2;
    public EntryService (timeTableEntryRepo repo, SubjectRepo repo2){
        this.repo2=repo2;
        this.repo=repo;
    }

    public timeTableEntry create(timeTableEntry entry){
    if (entry.getSubject() == null) {
            throw new IllegalArgumentException("Subject cannot be null");
        }
    if(!repo2.existsById(entry.getSubject().getId())) {
        throw new IllegalArgumentException("Subject does not exist");
    }
    return repo.save(entry);
    }
    public List<timeTableEntry> getAll() {
        return repo.findAll();
    }

    public List<timeTableEntry> getByDay(DayOfWeek day){
    return repo.findByDayOrderByStartTime(day);
    }

    public timeTableEntry update(Long id, timeTableEntry entry) {
        timeTableEntry e=repo.findById(id).orElseThrow(()-> new EntityNotFoundException("This Entry is invalid and does not exist!"));
        if (entry.getSubject() == null) {
            throw new IllegalArgumentException("Subject cannot be null");
        }
        if(!repo2.existsById(entry.getSubject().getId())) {
            throw new IllegalArgumentException("Subject does not exist");
        }
        e.setEndTime(entry.getEndTime());
        e.setStartTime(entry.getStartTime());
        e.setSubject(entry.getSubject());
        e.setDay(entry.getDay());
        return repo.save(e);
    }

    public void delete(Long id) {
        timeTableEntry e=repo.findById(id).orElseThrow(()-> new EntityNotFoundException("This Entry is invalid and does not exist!"));
        repo.deleteById(id);
    }
}
