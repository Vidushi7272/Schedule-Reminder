package com.vidushi.schedulereminder.Controller;

import com.vidushi.schedulereminder.Module.Reminder;
import com.vidushi.schedulereminder.Service.ReminderService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ReminderController {

    private final ReminderService reminderService;

    public ReminderController(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @PostMapping("/Reminder")
    public Reminder addReminder(@Valid @RequestBody Reminder reminder) {
        return reminderService.addReminder(reminder);
    }

    @GetMapping("/Reminder")
    public List<Reminder> viewAllReminders() {
        return reminderService.viewAllReminders();
    }

    @GetMapping("/Reminder/{id}")
    public Reminder viewOneReminder(@PathVariable Long id) {
        return reminderService.viewOneReminder(id);
    }

    @PutMapping("/Reminder/{id}")
    public Reminder editReminder(@RequestBody Reminder reminder,
            @PathVariable Long id
    ) {
        return reminderService.editReminder(reminder, id);
    }

    @DeleteMapping("/Reminder/{id}")
    public String deleteReminder(@PathVariable Long id) {
        reminderService.deleteReminder(id);

        return "Reminder deleted successfully";
    }

    @DeleteMapping("/Reminder/all")
    public String deleteAllReminders() {
        reminderService.deleteAllReminders();

        return "All reminders deleted successfully";
    }
}