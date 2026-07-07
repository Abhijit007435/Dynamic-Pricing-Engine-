package com.dynamicpricing.pricing_backend.exception;

import com.dynamicpricing.pricing_backend.dtos.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse>
    handleRuntimeException(RuntimeException ex) {

        ErrorResponse error =
                new ErrorResponse(
                        ex.getMessage(),
                        HttpStatus.NOT_FOUND.value(),
                        LocalDateTime.now()
                );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(error);
    }
    @SuppressWarnings("null")
    @ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ErrorResponse>
handleValidationException(
        MethodArgumentNotValidException ex) {

    String message =
            ex.getBindingResult()
                    .getFieldError()
                    .getDefaultMessage();

    ErrorResponse error =
            new ErrorResponse(
                    message,
                    HttpStatus.BAD_REQUEST.value(),
                    LocalDateTime.now()
            );

    return ResponseEntity
            .badRequest()
            .body(error);
}
}