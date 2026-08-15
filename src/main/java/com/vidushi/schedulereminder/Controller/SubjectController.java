package com.vidushi.schedulereminder.Controller;

import com.vidushi.schedulereminder.Module.Subject;
import com.vidushi.schedulereminder.Service.SubjectService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class SubjectController {
private final SubjectService service;
SubjectController(SubjectService service){
    this.service=service;
}
@PostMapping("/Subject")
    public Subject addNew(@RequestBody @Valid Subject x){
    return service.addNew(x);
}
@DeleteMapping("/Subject/all")
    public void deleteAll(){
    service.deleteAll();
}
@DeleteMapping("/Subject/{id}")
    public void delete(@PathVariable Long id){
    service.delete(id);
}
@GetMapping("/Subject")
    public List<Subject> view(){
    return service.view();
}
@PutMapping("/Subject/{id}")
    public Subject edit(@RequestBody @Valid Subject x,@PathVariable Long id){
    return service.edit(x, id);
}
}
