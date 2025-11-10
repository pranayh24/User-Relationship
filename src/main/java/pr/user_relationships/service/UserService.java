package pr.user_relationships.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pr.user_relationships.dto.CreateUserRequest;
import pr.user_relationships.dto.GraphResponse;
import pr.user_relationships.dto.UpdateUserRequest;
import pr.user_relationships.dto.UserDTO;
import pr.user_relationships.entity.User;
import pr.user_relationships.exception.ConflictException;
import pr.user_relationships.exception.ResourceNotFoundException;
import pr.user_relationships.repository.UserRepository;
import pr.user_relationships.dto.Relationship;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(String id) {
        User user = findUserById(id);
        return convertToDTO(user);
    }

    public UserDTO createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username already exists: " + request.getUsername());
        }

        User user = User.builder()
                .username(request.getUsername())
                .age(request.getAge())
                .hobbies(new ArrayList<>(request.getHobbies()))
                .friends(new HashSet<>())
                .build();

        User savedUser = userRepository.save(user);
        log.info("Created user: {}", savedUser.getId());
        return convertToDTO(savedUser);
    }

    public UserDTO updateUser(String id, UpdateUserRequest request) {
        User user = findUserById(id);

        if (request.getUsername() != null) {
            if (!request.getUsername().equals(user.getUsername()) &&
                    userRepository.existsByUsername(request.getUsername())) {
                throw new ConflictException("Username already exists: " + request.getUsername());
            }
            user.setUsername(request.getUsername());
        }

        if (request.getAge() != null) {
            user.setAge(request.getAge());
        }

        if (request.getHobbies() != null && !request.getHobbies().isEmpty()) {
            user.setHobbies(new ArrayList<>(request.getHobbies()));
        }

        User updatedUser = userRepository.save(user);
        log.info("Updated user: {}", updatedUser.getId());
        return convertToDTO(updatedUser);
    }

    public void deleteUser(String id) {
        User user = findUserById(id);

        if (!user.getFriends().isEmpty()) {
            throw new ConflictException(
                    "Cannot delete user with existing friendships. Please unlink all friends first."
            );
        }

        userRepository.delete(user);
        log.info("Deleted user: {}", id);
    }

    public UserDTO linkUsers(String userId, String friendId) throws BadRequestException {
        if (userId.equals(friendId)) {
            throw new BadRequestException("User cannot be friends with themselves");
        }

        User user = findUserById(userId);
        User friend = findUserById(friendId);

        if (user.getFriends().contains(friend)) {
            throw new ConflictException("Users are already friends");
        }

        user.addFriend(friend);
        userRepository.save(user);
        userRepository.save(friend);

        log.info("Linked users: {} and {}", userId, friendId);
        return convertToDTO(user);
    }

    public UserDTO unlinkUsers(String userId, String friendId) throws BadRequestException {
        User user = findUserById(userId);
        User friend = findUserById(friendId);

        if (!user.getFriends().contains(friend)) {
            throw new BadRequestException("Users are not friends");
        }

        user.removeFriend(friend);
        userRepository.save(user);
        userRepository.save(friend);

        log.info("Unlinked users: {} and {}", userId, friendId);
        return convertToDTO(user);
    }

    public GraphResponse getGraphData() {
        List<User> users = userRepository.findAll();
        List<UserDTO> userDTOs = users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        Set<Relationship> relationships = new HashSet<>();
        for (User user : users) {
            for (User friend : user.getFriends()) {
                String id1 = user.getId();
                String id2 = friend.getId();
                // Ensure consistent ordering to prevent duplicates
                if (id1.compareTo(id2) < 0) {
                    relationships.add(Relationship.builder()
                            .userId1(id1)
                            .userId2(id2)
                            .build());
                } else {
                    relationships.add(Relationship.builder()
                            .userId1(id2)
                            .userId2(id1)
                            .build());
                }
            }
        }

        return GraphResponse.builder()
                .users(userDTOs)
                .relationships(new ArrayList<>(relationships))
                .build();
    }

    private User findUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private UserDTO convertToDTO(User user) {
        user.calculatePopularityScore();
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .age(user.getAge())
                .hobbies(new ArrayList<>(user.getHobbies()))
                .friends(user.getFriends().stream()
                        .map(User::getId)
                        .collect(Collectors.toList()))
                .createdAt(user.getCreatedAt())
                .popularityScore(user.getPopularityScore())
                .build();
    }
}
