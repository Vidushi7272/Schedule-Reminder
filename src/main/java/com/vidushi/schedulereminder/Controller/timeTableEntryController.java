package com.vidushi.schedulereminder.Controller;

import com.vidushi.schedulereminder.Module.timeTableEntry;
import com.vidushi.schedulereminder.Service.EntryService;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.util.List;

@RestController
public class timeTableEntryController {
    EntryService service;
    public timeTableEntryController(EntryService service){
        this.service=service;
    }
    @PostMapping("/Entry")
    public timeTableEntry create(@RequestBody timeTableEntry entry){

        if(entry.getStartTime().isAfter(entry.getEndTime())||entry.getStartTime().equals(entry.getEndTime())){
            throw new IllegalArgumentException();
        }
        return service.create(entry);
    }

    @GetMapping("/Entry")
    public List<timeTableEntry> getAll() {
        return service.getAll();
    }

    @GetMapping("/day")
    public List<timeTableEntry> getByDay( @RequestParam(name="day") DayOfWeek day){
        return service.getByDay(day);
    }
    @PutMapping("/Entry/{id}")
    public timeTableEntry update(
            @PathVariable Long id,
            @RequestBody timeTableEntry entry) {
        if(entry.getStartTime().isAfter(entry.getEndTime())||entry.getStartTime().equals(entry.getEndTime())){
            throw new IllegalArgumentException();
        }
        return service.update(id, entry);
    }

    @DeleteMapping("/Entry/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
    @DeleteMapping("/Entry/all")
    public void deleteAll() {
        service.deleteAll();
    }
}
