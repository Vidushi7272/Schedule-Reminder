package com.vidushi.schedulereminder.Repository;


import com.vidushi.schedulereminder.Module.timeTableEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface timeTableEntryRepo extends JpaRepository<timeTableEntry,Long> {
public List<timeTableEntry> findByDayOrderByStartTime(DayOfWeek day);
}
