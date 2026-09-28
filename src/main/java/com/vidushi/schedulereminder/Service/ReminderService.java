package com.vidushi.schedulereminder.Service;

import com.vidushi.schedulereminder.Module.Reminder;
import com.vidushi.schedulereminder.Module.RepeatType;
import com.vidushi.schedulereminder.Repository.ReminderRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReminderService {

    private final ReminderRepository reminderRepo;

    public ReminderService(ReminderRepository reminderRepo) {
        this.reminderRepo = reminderRepo;
    }
    private void validateRepeatType(Reminder reminder) {

        LocalDateTime createdAt = reminder.getCreatedAt();
        LocalDateTime deadline = reminder.getDeadline();

        // Deadline must be after creation time
        if (!deadline.isAfter(createdAt)) {
            throw new IllegalArgumentException(
                    "Deadline must be after creation time."
            );
        }

        Duration duration = Duration.between(createdAt, deadline);

        RepeatType type = reminder.getRepeatType();

        // ≤ 1 hour → ONCE only
        if (duration.compareTo(Duration.ofHours(1)) <= 0) {

            if (type != RepeatType.ONCE) {
                throw new IllegalArgumentException(
                        "Only ONCE reminders are allowed for deadlines within 1 hour."
                );
            }
        }

        // > 1 hour and ≤ 24 hours → ONCE or HOURLY
        else if (duration.compareTo(Duration.ofHours(24)) <= 0) {

            if (type != RepeatType.ONCE &&
                    type != RepeatType.HOURLY) {

                throw new IllegalArgumentException(
                        "Only ONCE or HOURLY reminders are allowed for this deadline."
                );
            }
        }

        // > 24 hours and ≤ 7 days → ONCE, HOURLY or DAILY
        else if (duration.compareTo(Duration.ofDays(7)) <= 0) {

            if (type != RepeatType.ONCE &&
                    type != RepeatType.HOURLY &&
                    type != RepeatType.DAILY) {

                throw new IllegalArgumentException(
                        "Only ONCE, HOURLY or DAILY reminders are allowed for this deadline."
                );
            }
        }

        // > 7 days → all repeat types allowed
    }
    private void calculateNextReminderTime(Reminder reminder){
        LocalDateTime createdAt = reminder.getCreatedAt();

        switch (reminder.getRepeatType()) {

            case ONCE:
                reminder.setNextReminderTime(reminder.getDeadline());
                break;

            case HOURLY:
                reminder.setNextReminderTime(
                        createdAt.plusHours(1)
                );
                break;

            case DAILY:
                reminder.setNextReminderTime(
                        createdAt.plusDays(1)
                );
                break;

            case WEEKLY:
                reminder.setNextReminderTime(
                        createdAt.plusWeeks(1)
                );
                break;
        }
    }
    public Reminder addReminder(Reminder reminder) {
        reminder.setCreatedAt(LocalDateTime.now());
        if (reminder.getRepeatType() == null) {
            reminder.setRepeatType(RepeatType.ONCE);
        }

        validateRepeatType(reminder);

        calculateNextReminderTime(reminder);

        return reminderRepo.save(reminder);
        }

    public List<Reminder> viewAllReminders() {
        return reminderRepo.findAll();
    }

    public Reminder viewOneReminder(Long id) {
        return reminderRepo.findById(id).orElse(null);
    }

    public Reminder editReminder(Reminder reminder, Long id) {

        Reminder existingReminder = reminderRepo.findById(id).orElse(null);

        if (existingReminder != null) {

            existingReminder.setTitle(reminder.getTitle());
            existingReminder.setDescription(reminder.getDescription());
            existingReminder.setDeadline(reminder.getDeadline());
            existingReminder.setRepeatType(reminder.getRepeatType());
            existingReminder.setCompleted(reminder.isCompleted());

            // If repeatType is not provided, default to ONCE
            if (existingReminder.getRepeatType() == null) {
                existingReminder.setRepeatType(RepeatType.ONCE);
            }

            // Validate the updated reminder
            validateRepeatType(existingReminder);

            // Recalculate when the next reminder should occur
            calculateNextReminderTime(existingReminder);

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