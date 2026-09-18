package com.vidushi.schedulereminder.Repository;

import com.vidushi.schedulereminder.Module.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ReminderRepository extends JpaRepository<Reminder,Long> {
    public List<Reminder> findByCompletedFalseAndNextReminderTimeLessThanEqual(LocalDateTime current);
}
