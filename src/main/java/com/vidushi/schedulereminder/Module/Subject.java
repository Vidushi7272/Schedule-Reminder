package com.vidushi.schedulereminder.Module;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

@Entity
public class Subject {
    public Long getId() {
        return id;
    }

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTitle() {
        return title;
    }

    @NotBlank(message="title cannot be empty")
    @Size(max=20, message="Title cannot exceed 20 characters")
    @Column(unique=true)
    private String title;

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
    @OneToMany(mappedBy = "subject")

    private List<Reminder> reminders;
    private String color;
}
