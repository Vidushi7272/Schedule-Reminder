package com.vidushi.schedulereminder.Module;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
public class Reminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;

    private LocalDateTime createdAt;
    @NotNull
    private LocalDateTime deadline;

    private LocalDateTime nextReminderTime;

    @Enumerated(EnumType.STRING)
    private RepeatType repeatType;

    private boolean completed = false;

    public Reminder() {
    }
    @PrePersist
    public void setInitialReminderTime() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        switch (repeatType) {

            case HOURLY:
                nextReminderTime = createdAt.plusHours(1);
                break;

            case DAILY:
                nextReminderTime = createdAt.plusDays(1);
                break;

            case WEEKLY:
                nextReminderTime = createdAt.plusWeeks(1);
                break;

            case ONCE:
                nextReminderTime = deadline;
                break;
        }

    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDateTime deadline) {
        this.deadline = deadline;
    }

    public LocalDateTime getNextReminderTime() {
        return nextReminderTime;
    }

    public void setNextReminderTime(LocalDateTime nextReminderTime) {
        this.nextReminderTime = nextReminderTime;
    }

    public RepeatType getRepeatType() {
        return repeatType;
    }

    public void setRepeatType(RepeatType repeatType) {
        this.repeatType = repeatType;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
}