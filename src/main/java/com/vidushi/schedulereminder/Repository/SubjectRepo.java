package com.vidushi.schedulereminder.Repository;

import com.vidushi.schedulereminder.Module.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubjectRepo extends JpaRepository<Subject,Long> {
}
