package com.vidushi.schedulereminder.Module;

import jakarta.persistence.*;

import java.time.DayOfWeek;
import java.time.LocalTime;
@Entity
public class timeTableEntry {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;
    private DayOfWeek day;

    public Subject getSubject() {
        return subject;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    public DayOfWeek getDay() {
        return day;
    }

    public void setDay(DayOfWeek day) {
        this.day = day;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    private LocalTime startTime;
    private LocalTime endTime;
    @ManyToOne
    private Subject subject;
}
