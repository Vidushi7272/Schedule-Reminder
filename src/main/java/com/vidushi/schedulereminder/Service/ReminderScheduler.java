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
        List<Reminder> due = repo.findByCompletedFalseAndNextReminderTimeLessThanEqual(current);
            for(Reminder Due: due){
            LocalDateTime next= Due.getNextReminderTime();
            if(Due.getDeadline().isAfter(next)){
            System.out.println("Clock is ticking");
            System.out.println(Due.getTitle() + " is to be done by " + Due.getDeadline());
            RepeatType r= Due.getRepeatType();
            switch(r){
                case HOURLY : Due.setNextReminderTime(next.plusHours(1)); break;
                case DAILY: Due.setNextReminderTime(next.plusDays(1)); break;
                case WEEKLY: Due.setNextReminderTime(next.plusWeeks(1)); break;
            }
            repo.save(Due);
            }
            else if(Due.getRepeatType()== RepeatType.ONCE){
                System.out.println("Here is a Reminder for:");
                System.out.println(Due.getTitle());
                repo.deleteById(Due.getId());
            }
            else{
              repo.deleteById(Due.getId());
            }

               }}}