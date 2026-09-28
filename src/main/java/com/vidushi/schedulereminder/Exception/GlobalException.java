package com.vidushi.schedulereminder.Exception;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalException {
    @ExceptionHandler(MethodArgumentNotValidException.class)
public Map<String, String> handleValidationException(MethodArgumentNotValidException ex){
        Map<String, String> errors = new HashMap<>();

        errors.put(
                "error",
                ex.getBindingResult()
                        .getFieldError()
                        .getDefaultMessage()
        );

        return errors;
    }
    @ExceptionHandler(IllegalArgumentException.class)
    public Map<String,String> handleIllegalArguementException(IllegalArgumentException ex){
        Map<String, String> errors = new HashMap<>();

        errors.put(
                "error",
                ex.getLocalizedMessage()
        );

        return errors;
    }
}
