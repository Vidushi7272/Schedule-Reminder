package com.vidushi.schedulereminder.Service;

import com.vidushi.schedulereminder.Module.Reminder;
import com.vidushi.schedulereminder.Repository.ReminderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReminderService {

    private final ReminderRepository reminderRepo;

    public ReminderService(ReminderRepository reminderRepo) {
        this.reminderRepo = reminderRepo;
    }

    public Reminder addReminder(Reminder reminder) {
        return reminderRepo.save(reminder);
    }

    public List<Reminder> viewAllReminders() {
        return reminderRepo.findAll();
    }

    public Reminder viewOneReminder(Long id) {
        return reminderRepo.findById(id).orElse(null);
    }

    public Reminder editReminder(Reminder reminder, Long id) {

        Reminder existingReminder =
                reminderRepo.findById(id).orElse(null);

        if (existingReminder != null) {

            existingReminder.setTitle(reminder.getTitle());

            existingReminder.setDescription(
                    reminder.getDescription()
            );

            existingReminder.setDeadline(
                    reminder.getDeadline()
            );

            existingReminder.setRepeatType(
                    reminder.getRepeatType()
            );

            existingReminder.setCompleted(
                    reminder.isCompleted()
            );

            return reminderRepo.save(existingReminder);
        }

        return null;
    }

    public void deleteReminder(Long id) {
        reminderRepo.deleteById(id);
    }

    public void deleteAllReminders() {
        reminderRepo.deleteAll();
    }
}