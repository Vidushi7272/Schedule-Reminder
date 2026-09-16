package com.vidushi.schedulereminder.Repository;

import com.vidushi.schedulereminder.Module.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReminderRepository extends JpaRepository<Reminder,Long> {
}
