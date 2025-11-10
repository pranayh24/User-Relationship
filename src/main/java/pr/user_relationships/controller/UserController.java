package pr.user_relationships.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pr.user_relationships.dto.CreateUserRequest;
import pr.user_relationships.dto.GraphResponse;
import pr.user_relationships.dto.UpdateUserRequest;
import pr.user_relationships.dto.UserDTO;
import pr.user_relationships.service.UserService;
import pr.user_relationships.dto.LinkRequest;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping("/users")
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserDTO createdUser = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{id}/link")
    public ResponseEntity<UserDTO> linkUsers(
            @PathVariable String id,
            @Valid @RequestBody LinkRequest request) throws BadRequestException {
        return ResponseEntity.ok(userService.linkUsers(id, request.getFriendId()));
    }

    @DeleteMapping("/users/{id}/unlink")
    public ResponseEntity<UserDTO> unlinkUsers(
            @PathVariable String id,
            @Valid @RequestBody LinkRequest request) throws BadRequestException {
        return ResponseEntity.ok(userService.unlinkUsers(id, request.getFriendId()));
    }

    @GetMapping("/graph")
    public ResponseEntity<GraphResponse> getGraphData() {
        return ResponseEntity.ok(userService.getGraphData());
    }
}
