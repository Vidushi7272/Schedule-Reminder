package com.vidushi.schedulereminder.Service;

import com.vidushi.schedulereminder.Module.Reminder;
import com.vidushi.schedulereminder.Module.RepeatType;
import com.vidushi.schedulereminder.Repository.ReminderRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class ReminderScheduler {
        private final ReminderRepository repo;
        public ReminderScheduler(ReminderRepository repo) {
        this.repo = repo;
        }

    @Scheduled(fixedDelay = 60000)
    public void Scheduler() {

        LocalDateTime current = LocalDateTime.now();

        List<Reminder> due =
                repo.findByCompletedFalseAndNextReminderTimeLessThanEqual(current);

        for (Reminder reminder : due) {

            System.out.println("Here is a Reminder for:");
            System.out.println(reminder.getTitle());
            System.out.println(
                    "This reminder is due by " + reminder.getDeadline()
            );

            // ONCE reminder → it is finished after triggering
            if (reminder.getRepeatType() == RepeatType.ONCE) {
                reminder.setCompleted(true);
                repo.save(reminder);
                continue;
            }

            LocalDateTime next = reminder.getNextReminderTime();

            switch (reminder.getRepeatType()) {

                case HOURLY:
                    next = next.plusHours(1);
                    break;

                case DAILY:
                    next = next.plusDays(1);
                    break;

                case WEEKLY:
                    next = next.plusWeeks(1);
                    break;
            }

            // Don't schedule another reminder at or after the deadline
            if (next.isBefore(reminder.getDeadline())) {

                reminder.setNextReminderTime(next);
                repo.save(reminder);

            } else {

                // No more repetitions before the deadline
                reminder.setCompleted(true);
                repo.save(reminder);
            }
        }}}